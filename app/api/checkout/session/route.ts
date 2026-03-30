import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    // Only return safe, non-sensitive data
    return NextResponse.json({
      orderRef: session.id.slice(-8).toUpperCase(),
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
      deliveryMethod: session.metadata?.deliveryMethod,
      items: session.line_items?.data.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        amount: item.amount_total,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
}
