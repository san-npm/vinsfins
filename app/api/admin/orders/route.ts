import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { stripe } from "@/lib/stripe";
import { verifyToken } from "@/lib/admin-auth";
import { loadData } from "@/lib/storage";
import { wines as defaultWines, type Wine } from "@/data/wines";
import { trackingUrl } from "@/lib/dpd-api";

/**
 * Recent orders, read from Stripe on every request.
 *
 * The shop persists nothing per order of its own: Stripe is the record, and the
 * only thing this app adds is the DPD parcel record the sync job keeps in KV.
 * So the list is Stripe's, enriched from KV, and never cached.
 */

const NO_STORE = { "Cache-Control": "no-store" };
const DEFAULT_LIMIT = 25;
/** Stripe's own page size ceiling. Asking for more is a 400 from their API. */
const MAX_LIMIT = 100;

interface DpdRecord {
  reference?: string;
  trackingCodes?: string[];
}

/**
 * Resolve the packing list from the session metadata.
 *
 * The session carries wine ids only, so names come from the shop's own data.
 * An unknown id falls back to the id itself and malformed JSON yields an empty
 * list: a bad line must cost that order its packing list, not the whole page.
 */
export function parseOrderItems(
  itemsJson: string | undefined,
  nameById: Map<string, string>,
): { name: string; qty: number }[] {
  try {
    const raw = JSON.parse(itemsJson ?? "[]") as { id: string; qty: number }[];
    if (!Array.isArray(raw)) return [];
    return raw.map((i) => ({ name: nameById.get(i.id) ?? i.id, qty: i.qty }));
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const asked = Number(req.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(asked)
    ? Math.min(Math.max(Math.trunc(asked), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  let sessions;
  try {
    // Only "complete" sessions are orders. Open ones are abandoned baskets and
    // expired ones never paid, and neither belongs in a list the shop packs from.
    sessions = await stripe.checkout.sessions.list({ limit, status: "complete" });
  } catch (err) {
    console.error("[vinsfins admin:orders] Stripe list failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Stripe unavailable" }, { status: 503, headers: NO_STORE });
  }

  // Wine names live in the shop's own data, not on the session: the metadata
  // carries ids only. A renamed or deleted wine falls back to its id rather
  // than blanking the line.
  const wines = (await loadData("wines", defaultWines).catch(() => defaultWines)) as Wine[];
  const nameById = new Map(wines.map((w) => [w.id, w.name]));

  // One KV round trip for the whole page rather than one per order. mget with
  // no keys is an error, so the empty page short-circuits.
  const dpdBySession = new Map<string, DpdRecord>();
  if (sessions.data.length > 0) {
    const keys = sessions.data.map((s) => `dpd:${s.id}`);
    const records = await kv.mget<(DpdRecord | null)[]>(...keys).catch(() => []);
    sessions.data.forEach((s, i) => {
      const rec = records[i];
      if (rec) dpdBySession.set(s.id, rec);
    });
  }

  const orders = sessions.data.map((s) => {
    const shipping = s.collected_information?.shipping_details ?? null;
    const dpd = dpdBySession.get(s.id);
    return {
      ref: s.id.slice(-8).toUpperCase(),
      sessionId: s.id,
      created: s.created * 1000,
      amount: s.amount_total ?? 0,
      currency: (s.currency ?? "eur").toUpperCase(),
      paymentStatus: s.payment_status,
      deliveryMethod: s.metadata?.deliveryMethod === "delivery" ? "delivery" : "pickup",
      customer: {
        name: shipping?.name ?? s.customer_details?.name ?? null,
        email: s.customer_details?.email ?? null,
        phone: s.customer_details?.phone ?? null,
      },
      address: shipping?.address
        ? {
            line1: shipping.address.line1,
            line2: shipping.address.line2,
            postalCode: shipping.address.postal_code,
            city: shipping.address.city,
            country: shipping.address.country,
          }
        : null,
      items: parseOrderItems(s.metadata?.itemsJson, nameById),
      dpd: dpd?.reference
        ? {
            reference: dpd.reference,
            tracking: (dpd.trackingCodes ?? []).map((code) => ({ code, url: trackingUrl(code) })),
          }
        : null,
    };
  });

  return NextResponse.json({ orders }, { headers: NO_STORE });
}
