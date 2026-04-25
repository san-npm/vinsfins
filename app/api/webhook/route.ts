import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sendOrderConfirmation } from "@/lib/email";
import { releaseStock } from "@/lib/stock";
import { kv } from "@vercel/kv";
import Stripe from "stripe";

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

  const stripe = getStripe();

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

  // Send confirmation email (customer + admin)
  await sendOrderConfirmation(fullSession, orderItems);

  // Stock was already reserved atomically at checkout creation (DECRBY).
  // Nothing to do here — stock is already decremented.
  // Idempotency already marked via SETNX in isAlreadyProcessed().

  console.log("Order fulfilled:", session.id);
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
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (isGrocerieSession(session)) return ackSkip();
      console.log("Checkout completed:", {
        sessionId: session.id,
        email: session.customer_details?.email,
        amount: session.amount_total,
        paymentStatus: session.payment_status,
        deliveryMethod: session.metadata?.deliveryMethod,
      });

      if (session.payment_status === "paid") {
        await fulfillOrder(session);
      }
      break;
    }

    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (isGrocerieSession(session)) return ackSkip();
      console.log("Async payment succeeded:", session.id);
      await fulfillOrder(session);
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (isGrocerieSession(session)) return ackSkip();
      console.log("Async payment failed:", session.id);
      await handlePaymentFailed(session);
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (isGrocerieSession(session)) return ackSkip();
      console.log("Session expired:", session.id);
      await handlePaymentFailed(session);
      break;
    }

    case "charge.refunded": {
      // Refund issued from the Stripe dashboard. Log for reconciliation;
      // we do NOT auto-restock because the wine may already have shipped.
      // Admin restores stock manually via the admin panel if warranted.
      const charge = event.data.object as Stripe.Charge;
      if (isGrocerieCharge(charge)) return ackSkip();
      console.log("Charge refunded:", {
        chargeId: charge.id,
        paymentIntent: charge.payment_intent,
        amount: charge.amount_refunded,
        currency: charge.currency,
        reason: charge.refunds?.data[0]?.reason,
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
