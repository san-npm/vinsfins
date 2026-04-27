import { NextRequest, NextResponse } from "next/server";
import "@/lib/env";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmation, retrySendEmail } from "@/lib/email";
import { releaseStock } from "@/lib/stock";
import { kv } from "@vercel/kv";
import Stripe from "stripe";

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

// Stripe SDK types omit `shipping_details` on Session in this version.
type SessionWithShipping = Stripe.Checkout.Session & {
  shipping_details?: {
    name?: string | null;
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
  } | null;
};

function checkDeliveryAddress(session: Stripe.Checkout.Session): DeliveryCheck {
  if (session.metadata?.deliveryMethod !== "delivery") return { ok: true };

  const shipping = (session as SessionWithShipping).shipping_details ?? null;
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
        <li><strong>Reason:</strong> ${reason}</li>
        <li><strong>Country received:</strong> ${country ?? "(none)"}</li>
        <li><strong>Customer email:</strong> ${customerEmail}</li>
        <li><strong>Amount:</strong> ${(amount / 100).toFixed(2)} €</li>
        <li><strong>Delivery method:</strong> ${session.metadata?.deliveryMethod ?? "(none)"}</li>
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

/**
 * Atomic idempotency via Redis SETNX.
 * Returns true if this session was already processed.
 * Key expires after 7 days to avoid unbounded growth.
 */
async function isAlreadyProcessed(sessionId: string): Promise<boolean> {
  // SETNX returns 1 if key was set (first time), 0 if already exists
  const wasSet = await kv.setnx(`fulfilled:${sessionId}`, 1);
  if (wasSet) {
    // First time — set TTL of 7 days
    await kv.expire(`fulfilled:${sessionId}`, 7 * 24 * 60 * 60);
    return false; // Not previously processed
  }
  return true; // Already processed
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

async function fulfillOrder(session: Stripe.Checkout.Session) {
  if (await isAlreadyProcessed(session.id)) {
    console.log("Session already processed, skipping:", session.id);
    return;
  }

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
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["shipping_details"],
  });

  const verdict = checkDeliveryAddress(fullSession);
  if (!verdict.ok) {
    await flagOrderForReview(fullSession, verdict.reason, verdict.country);
    // The order can't ship to this address. Release the reservation so
    // the inventory isn't permanently understated when admin refunds.
    // If admin negotiates a valid address with the customer, they will
    // re-place the order and the new reservation will decrement again.
    const items = parseSessionItems(fullSession);
    if (items.length > 0) {
      await releaseStock(items);
    }
    console.warn(`[vinsfins webhook] flagged ${session.id.slice(-8).toUpperCase()} reason=${verdict.reason}${verdict.country ? ` country=${verdict.country}` : ""}`);
    return;
  }

  // Send confirmation email (customer + admin)
  await sendOrderConfirmation(fullSession, orderItems);

  // Stock was already reserved atomically at checkout creation (DECRBY).
  // Idempotency already marked via SETNX in isAlreadyProcessed().
}

/**
 * Release reserved stock when payment fails or session expires.
 * Uses SETNX for idempotency — prevents duplicate releases on Stripe retries.
 */
async function handlePaymentFailed(session: Stripe.Checkout.Session) {
  const releaseKey = `released:${session.id}`;
  const wasSet = await kv.setnx(releaseKey, 1);
  if (!wasSet) {
    console.log("Stock already released for session, skipping:", session.id);
    return;
  }
  await kv.expire(releaseKey, 7 * 24 * 60 * 60); // 7 day TTL

  const items = parseSessionItems(session);
  if (items.length > 0) {
    await releaseStock(items);
    console.log("Stock released for failed/expired session:", session.id);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
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
