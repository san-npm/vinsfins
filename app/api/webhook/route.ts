import { NextRequest, NextResponse } from "next/server";
import "@/lib/env";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmation, retrySendEmail, esc } from "@/lib/email";
import { releaseStock } from "@/lib/stock";
import { isShipCountry } from "@/lib/dpd";
import { createDraftShipment, isDpdConfigured } from "@/lib/dpd-api";
import { kv } from "@vercel/kv";
import Stripe from "stripe";

// Stripe abandons a webhook after ~20s. The DPD call is bounded at 8s, so give
// the function room to finish and report rather than being killed mid-flight.
export const maxDuration = 30;

const ALLOWED_DELIVERY_COUNTRIES = new Set(["LU", "FR", "DE", "BE"]);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "contact@vinsfins.lu";

const MAX_NAME_LEN = 200;
const MAX_LINE_LEN = 200;
const MAX_CITY_LEN = 100;
const MAX_POSTAL_LEN = 20;
const POSTAL_RE = /^[A-Za-z0-9 \-]{2,20}$/;

type DeliveryCheck =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "missing-shipping-country"
        | "country-not-allowed"
        | "missing-shipping-name"
        | "missing-shipping-line1"
        | "missing-shipping-postal-code"
        | "missing-shipping-city"
        | "address-field-too-long"
        | "invalid-postal-code";
      country?: string;
    };

function tooLong(value: string | null | undefined, max: number): boolean {
  return typeof value === "string" && value.length > max;
}

/**
 * Stripe moved the collected shipping address to `collected_information` in the
 * 2025-03-31.basil API version. Both sites pin a later version, so the old
 * top-level `shipping_details` no longer exists and `expand: ["shipping_details"]`
 * is rejected with a 400. Read it from its current home.
 */
function shippingOf(session: Stripe.Checkout.Session) {
  return session.collected_information?.shipping_details ?? null;
}

function checkDeliveryAddress(session: Stripe.Checkout.Session): DeliveryCheck {
  if (session.metadata?.deliveryMethod !== "delivery") return { ok: true };

  const shipping = shippingOf(session);
  const address = shipping?.address ?? null;
  const country = address?.country?.toUpperCase();

  if (!country) return { ok: false, reason: "missing-shipping-country" };
  if (!ALLOWED_DELIVERY_COUNTRIES.has(country)) {
    return { ok: false, reason: "country-not-allowed", country };
  }
  if (!shipping?.name) return { ok: false, reason: "missing-shipping-name", country };
  if (!address?.line1) return { ok: false, reason: "missing-shipping-line1", country };
  if (!address?.city) return { ok: false, reason: "missing-shipping-city", country };
  if (!address?.postal_code) return { ok: false, reason: "missing-shipping-postal-code", country };
  if (
    tooLong(shipping.name, MAX_NAME_LEN) ||
    tooLong(address.line1, MAX_LINE_LEN) ||
    tooLong(address.line2, MAX_LINE_LEN) ||
    tooLong(address.city, MAX_CITY_LEN) ||
    tooLong(address.postal_code, MAX_POSTAL_LEN)
  ) {
    return { ok: false, reason: "address-field-too-long", country };
  }
  if (!POSTAL_RE.test(address.postal_code)) {
    return { ok: false, reason: "invalid-postal-code", country };
  }
  return { ok: true };
}

async function flagOrderForReview(
  session: Stripe.Checkout.Session,
  reason: string,
  country: string | undefined,
): Promise<void> {
  const orderRef = session.id.slice(-8).toUpperCase();
  const customerEmail = session.customer_details?.email ?? "(none)";
  const amount = session.amount_total ?? 0;
  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#333;max-width:600px">
      <h2 style="color:#8B0000">Order flagged for manual review</h2>
      <p>An order was paid but failed backend address validation and was <strong>not</strong> auto-confirmed.</p>
      <ul>
        <li><strong>Order:</strong> #${orderRef}</li>
        <li><strong>Session:</strong> ${session.id}</li>
        <li><strong>Reason:</strong> ${esc(reason)}</li>
        <li><strong>Country received:</strong> ${esc(country) || "(none)"}</li>
        <li><strong>Customer email:</strong> ${esc(customerEmail)}</li>
        <li><strong>Amount:</strong> ${(amount / 100).toFixed(2)} €</li>
        <li><strong>Delivery method:</strong> ${esc(session.metadata?.deliveryMethod) || "(none)"}</li>
      </ul>
      <p>Action: contact the customer, then either ship manually or refund via Stripe dashboard.</p>
    </div>
  `;
  // Persist a flag for admin visibility (24h TTL is enough — admin should act fast).
  await kv.set(`flagged_order:${session.id}`, {
    sessionId: session.id,
    reason,
    country: country ?? null,
    customerEmail,
    amount,
    createdAt: Date.now(),
  }, { ex: 30 * 24 * 60 * 60 }).catch(() => { /* best effort */ });

  await retrySendEmail({
    to: ADMIN_EMAIL,
    subject: `[REVIEW] Order #${orderRef} — ${reason}${country ? ` (${country})` : ""}`,
    html,
  });
}

const FULFILLED_KEY = (id: string) => `fulfilled:${id}`;

/**
 * Atomic idempotency claim. Returns true if this session was already processed.
 * The claim expires after 7 days to avoid unbounded growth.
 */
async function isAlreadyProcessed(sessionId: string): Promise<boolean> {
  // One atomic SET NX EX. The old SETNX-then-EXPIRE pair could leave a claim
  // with no TTL if KV failed between the two calls, and that claim would then
  // block the order's fulfilment forever.
  const claimed = await kv.set(FULFILLED_KEY(sessionId), 1, { nx: true, ex: 7 * 24 * 60 * 60 });
  return claimed === null;
}

// Roll back the claim so Stripe's retry actually retries. Without it, one
// transient error leaves a paid order with no confirmation email and no parcel,
// because every retry sees the claim and skips.
async function clearFulfilledClaim(sessionId: string): Promise<void> {
  try { await kv.del(FULFILLED_KEY(sessionId)); } catch { /* best effort */ }
}

/**
 * Parse items from session metadata (saved during checkout creation).
 */
function parseSessionItems(session: Stripe.Checkout.Session): { wineId: string; quantity: number }[] {
  try {
    const json = session.metadata?.itemsJson;
    if (!json) return [];
    const raw = JSON.parse(json) as { id: string; qty: number }[];
    return raw.map((i) => ({ wineId: i.id, quantity: i.qty }));
  } catch {
    return [];
  }
}

async function notifyAdmin(subject: string, html: string): Promise<void> {
  await retrySendEmail({ to: ADMIN_EMAIL, subject, html }).catch(() => {
    /* best effort: the console.error above is the last resort */
  });
}

/**
 * Book the DPD shipment for a paid delivery order.
 *
 * Creates a draft in the Web Parcel portal, already addressed and split into
 * the right number of parcels, for the shop to confirm and pay for. Deliberately
 * best-effort: a DPD outage must never cost the customer their confirmation
 * email, and the order is still recoverable by hand from the portal.
 */
async function bookDpdShipment(session: Stripe.Checkout.Session): Promise<void> {
  if (session.metadata?.deliveryMethod !== "delivery") return;
  // Inert until DPD_API_KEY is configured, so the swap can ship in stages.
  if (!isDpdConfigured()) return;

  const orderRef = session.id.slice(-8).toUpperCase();

  // Booking and persistence are reported separately on purpose. If the draft is
  // created and only the bookkeeping fails, telling the shop "could not be
  // created" would make them book and pay for a SECOND parcel.
  let reference: string;
  try {
    const shipping = shippingOf(session);
    const address = shipping?.address;
    const country = address?.country?.toUpperCase();
    if (!shipping?.name || !address?.line1 || !address.city || !address.postal_code || !isShipCountry(country)) {
      throw new Error("shipping address incomplete");
    }
    // The rate was priced for the country chosen on our checkout page and
    // Stripe was locked to it. Re-check here so a mismatch is caught before we
    // pay to ship somewhere the customer was not charged for.
    const priced = session.metadata?.shipCountry;
    if (priced && priced !== country) {
      throw new Error(`priced for ${priced} but addressed to ${country}`);
    }

    const bottles = parseSessionItems(session).reduce((sum, i) => sum + i.quantity, 0);
    if (bottles < 1) throw new Error("no items on session");

    // Goods value only — the shipping the customer paid is not cargo value.
    const goodsCents = session.amount_subtotal ?? session.amount_total ?? 0;

    ({ reference } = await createDraftShipment({
      orderRef: orderRef,
      bottles,
      contentValueEur: goodsCents / 100,
      to: {
        name: shipping.name,
        street1: address.line1,
        street2: address.line2 ?? undefined,
        zip: address.postal_code,
        city: address.city,
        country,
        phone: session.customer_details?.phone ?? undefined,
        email: session.customer_details?.email ?? undefined,
      },
    }));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[vinsfins webhook] DPD booking failed for ${orderRef}: ${message}`);
    await notifyAdmin(
      `[DPD] Order #${orderRef} — book this parcel by hand`,
      `<p>The order was paid and confirmed, but no DPD reference came back.</p>
       <p><strong>Reason:</strong> ${esc(message)}</p>
       <p><strong>Check Web Parcel for this order reference BEFORE creating anything</strong>:
          a call can fail after DPD has already accepted the parcel, and creating it
          again would mean paying twice.</p>
       <p>Order <strong>#${esc(orderRef)}</strong>.</p>`,
    );
    return;
  }

  console.log(`[vinsfins webhook] DPD draft ${reference} for order ${orderRef}`);

  try {
    // Queue membership FIRST. A set member with no record is self-healing (the
    // sync job drops it); a record with no set member is never looked at again.
    await kv.sadd("dpd:pending", session.id);
    await kv.set(
      `dpd:${session.id}`,
      {
        reference,
        orderRef: orderRef,
        sessionId: session.id,
        email: session.customer_details?.email ?? null,
        parcels: Number(session.metadata?.parcels ?? 1),
        trackingSent: false,
        attempts: 0,
        createdAt: Date.now(),
      },
      { ex: 90 * 24 * 60 * 60 },
    );
  } catch (err) {
    // The parcel EXISTS. Only the tracking-email queue entry is missing, so say
    // exactly that rather than sending the shop off to create a duplicate.
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[vinsfins webhook] DPD draft ${reference} created but not queued: ${message}`);
    await notifyAdmin(
      `[DPD] Order #${orderRef} — parcel booked, tracking email not queued`,
      `<p>DPD draft <strong>${esc(reference)}</strong> was created for order
         <strong>#${esc(orderRef)}</strong>. Do NOT create it again.</p>
       <p>Only the tracking-email queue entry failed, so send the customer their
          tracking number by hand once you confirm the parcel.</p>
       <p><strong>Reason:</strong> ${esc(message)}</p>`,
    );
  }
}

async function fulfillOrder(session: Stripe.Checkout.Session) {
  if (await isAlreadyProcessed(session.id)) {
    console.log("Session already processed, skipping:", session.id);
    return;
  }

  try {
    await runFulfilment(session);
  } catch (err) {
    // Un-poison the claim so Stripe's retry can fulfil the order.
    await clearFulfilledClaim(session.id);
    throw err;
  }
}

async function runFulfilment(session: Stripe.Checkout.Session) {
  // Retrieve line items for the email
  const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  });

  const orderItems = lineItemsResponse.data.map((item) => ({
    description: item.description || "Article",
    quantity: item.quantity || 1,
    amount: item.amount_total / (item.quantity || 1),
  }));

  // Retrieve full session with shipping details
  // No expand: collected_information is returned inline, and asking Stripe to
  // expand it (or the retired shipping_details) is a 400.
  const fullSession = await stripe.checkout.sessions.retrieve(session.id);

  const verdict = checkDeliveryAddress(fullSession);
  if (!verdict.ok) {
    await flagOrderForReview(fullSession, verdict.reason, verdict.country);
    // The order can't ship to this address. Release the reservation so
    // the inventory isn't permanently understated when admin refunds.
    // If admin negotiates a valid address with the customer, they will
    // re-place the order and the new reservation will decrement again.
    const items = parseSessionItems(fullSession);
    if (items.length > 0) {
      // Kept out of the rollback's blast radius: releaseStock is a plain
      // INCRBY loop with no idempotency guard, so re-running fulfilment after
      // a partial release would inflate stock. The order is already flagged
      // for a human, and a failed release is theirs to sort out.
      await releaseStock(items).catch((err) => {
        console.error(
          `[vinsfins webhook] stock release failed for flagged ${session.id.slice(-8).toUpperCase()}:`,
          err instanceof Error ? err.message : err,
        );
      });
    }
    console.warn(`[vinsfins webhook] flagged ${session.id.slice(-8).toUpperCase()} reason=${verdict.reason}${verdict.country ? ` country=${verdict.country}` : ""}`);
    return;
  }

  // Send confirmation email (customer + admin)
  await sendOrderConfirmation(fullSession, orderItems);

  // Hand the parcel to DPD. Runs after the email so a carrier problem can
  // never stop the customer being told their order went through.
  await bookDpdShipment(fullSession);

  // Stock was already reserved atomically at checkout creation (DECRBY).
  // Idempotency already marked via SETNX in isAlreadyProcessed().
}

/**
 * Release reserved stock when payment fails or session expires.
 * Uses SETNX for idempotency — prevents duplicate releases on Stripe retries.
 */
async function handlePaymentFailed(session: Stripe.Checkout.Session) {
  // Same atomic SET NX EX as the fulfilment claim: SETNX followed by a separate
  // EXPIRE can leave a claim with no TTL and block the release forever. This is
  // the highest-volume path here, since session.expired fires on every abandoned cart.
  const releaseKey = `released:${session.id}`;
  const claimed = await kv.set(releaseKey, 1, { nx: true, ex: 7 * 24 * 60 * 60 });
  if (claimed === null) {
    console.log("Stock already released for session, skipping:", session.id);
    return;
  }

  const items = parseSessionItems(session);
  if (items.length > 0) {
    await releaseStock(items);
    console.log("Stock released for failed/expired session:", session.id);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  // Defensive trim: an env value with trailing whitespace makes the Stripe
  // SDK reject every event with "provided signing secret contains whitespace"
  // and silently breaks order fulfilment. Caught live during the 2026-05-23
  // audit when the local .env.local had a trailing newline.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Vins Fins and La Grocerie share one Stripe account and each site
  // registers its own webhook endpoint, so every event lands on both.
  // La Grocerie tags its sessions/charges with metadata.source='grocerie'.
  // Ignore those here so the grocerie endpoint is the only one that
  // fulfils them (prevents duplicate emails and double processing).
  const ackSkip = () => NextResponse.json({ received: true, skipped: true });
  const isGrocerieSession = (s: Stripe.Checkout.Session | undefined | null) =>
    s?.metadata?.source === "grocerie";
  const isGrocerieCharge = (c: Stripe.Charge) => c.metadata?.source === "grocerie";

  const ref = (id: string) => id.slice(-8).toUpperCase();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (isGrocerieSession(session)) return ackSkip();
      console.log(`[vinsfins webhook] checkout.completed ${ref(session.id)} status=${session.payment_status}`);
      if (session.payment_status === "paid") {
        await fulfillOrder(session);
      }
      break;
    }

    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (isGrocerieSession(session)) return ackSkip();
      console.log(`[vinsfins webhook] async_payment.succeeded ${ref(session.id)}`);
      await fulfillOrder(session);
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (isGrocerieSession(session)) return ackSkip();
      console.log(`[vinsfins webhook] async_payment.failed ${ref(session.id)}`);
      await handlePaymentFailed(session);
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (isGrocerieSession(session)) return ackSkip();
      console.log(`[vinsfins webhook] session.expired ${ref(session.id)}`);
      await handlePaymentFailed(session);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (isGrocerieCharge(charge)) return ackSkip();
      console.log(`[vinsfins webhook] charge.refunded ${charge.id.slice(-8)} amount=${charge.amount_refunded}${charge.currency}`);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
