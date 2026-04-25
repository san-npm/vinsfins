import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { getStripe } from "@/lib/stripe";

function nonceMatches(metadataHash: string | undefined, cookie: string | undefined): boolean {
  if (!metadataHash || !cookie) return false;
  const expected = Buffer.from(metadataHash, "hex");
  const got = createHash("sha256").update(cookie).digest();
  if (expected.length !== got.length) return false;
  return timingSafeEqual(expected, got);
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    // Anyone with session_id alone cannot read order details. The HttpOnly
    // nonce cookie set at /api/checkout POST binds the session to the buyer's
    // browser; a shared URL without the cookie returns 404.
    const cookie = req.cookies.get("co_nonce")?.value;
    const metaHash = session.metadata?.nonceHash;
    if (!nonceMatches(metaHash, cookie)) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

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
