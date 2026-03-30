import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmation } from "@/lib/email";
import { updateStock } from "@/lib/stock";
import { loadData, saveData } from "@/lib/storage";
import Stripe from "stripe";

const PROCESSED_KEY = "processed-sessions";

async function isAlreadyProcessed(sessionId: string): Promise<boolean> {
  const processed = (await loadData(PROCESSED_KEY, [])) as string[];
  return processed.includes(sessionId);
}

async function markProcessed(sessionId: string): Promise<void> {
  const processed = (await loadData(PROCESSED_KEY, [])) as string[];
  // Keep last 500 to avoid unbounded growth
  const updated = [...processed.slice(-499), sessionId];
  await saveData(PROCESSED_KEY, updated);
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

  // Send confirmation email (customer + admin)
  await sendOrderConfirmation(fullSession, orderItems);

  // Update stock quantities
  await updateStock(fullSession);

  // Mark as processed to prevent duplicate fulfillment
  await markProcessed(session.id);

  console.log("Order fulfilled:", session.id);
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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
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
      console.log("Async payment succeeded:", session.id);
      await fulfillOrder(session);
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Async payment failed:", session.id);
      // Customer will see the failure on Stripe's page
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
