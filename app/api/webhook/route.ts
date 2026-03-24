import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

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
        // Payment received immediately (card payments)
        // TODO: Send order confirmation email
        // TODO: Update stock quantities
        console.log("Order fulfilled:", session.id);
      }
      // If payment_status is "unpaid", wait for async_payment_succeeded
      break;
    }

    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Async payment succeeded:", session.id);
      // TODO: Send order confirmation email
      // TODO: Update stock quantities
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Async payment failed:", session.id);
      // TODO: Notify customer about failed payment
      break;
    }

    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ received: true });
}
