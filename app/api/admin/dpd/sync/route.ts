import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { kv } from "@vercel/kv";
import { verifyToken } from "@/lib/admin-auth";
import { getShipment, isDpdConfigured, trackingUrl } from "@/lib/dpd-api";

/**
 * Collect DPD parcel numbers once they are issued.
 *
 * A DPD draft has no parcel number until the shop confirms and pays for it in
 * Web Parcel, so there is nothing to record at booking time. This job walks the
 * orders waiting on a number and stores each one as it appears; the numbers come
 * back in this endpoint's JSON response, which is the only place they surface.
 *
 * Runs either from the admin panel (session cookie) or from Vercel Cron, which
 * authenticates with `Authorization: Bearer $CRON_SECRET`.
 */

// Each item costs a Packlink round trip bounded at 8s plus KV.
// The wall-clock guard below is what actually keeps the run inside this.
export const maxDuration = 60;

const PENDING_SET = "dpd:pending";
const recordKey = (sessionId: string) => `dpd:${sessionId}`;

/**
 * Each item costs one Packlink round trip. Kept well inside the serverless
 * function budget: a backlog drains over successive runs rather than timing
 * out and losing the whole run.
 */
const MAX_PER_RUN = 20;

/** Stop starting new items once the run is this old, and finish cleanly. */
const RUN_BUDGET_MS = 45_000;

/**
 * The Vercel Hobby plan runs a cron at most once a day, so one attempt is one
 * day. Two weeks of waiting for the shop to confirm a draft is generous; past
 * that the order is abandoned rather than retried forever.
 */
const MAX_ATTEMPTS = 14;

/** A draft never confirmed within this window is abandoned, not retried forever. */
const STALE_MS = 30 * 24 * 60 * 60 * 1000;

const RECORD_TTL_SECONDS = 90 * 24 * 60 * 60;

interface PendingShipment {
  reference: string;
  orderRef: string;
  sessionId: string;
  parcels: number;
  trackingCodes?: string[];
  trackingCollected: boolean;
  attempts?: number;
  createdAt?: number;
}

/** Constant-time compare, matching how lib/admin-auth.ts handles every other secret. */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function isCronCall(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  return secretMatches(header.slice("Bearer ".length), secret);
}

export async function GET(req: NextRequest) {
  const authorized = isCronCall(req) || verifyToken(req);
  if (!authorized) {
    // Without CRON_SECRET this endpoint is unreachable by Cron and no customer
    // ever has its parcel number recorded. Say so in the logs rather than 401ing mutely.
    if (!process.env.CRON_SECRET) {
      console.error("[vinsfins dpd:sync] CRON_SECRET is not set — the scheduled tracking sync cannot run");
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDpdConfigured()) {
    return NextResponse.json({ error: "DPD_API_KEY is not configured" }, { status: 503 });
  }

  const sessionIds = (await kv.smembers<string[]>(PENDING_SET)) ?? [];
  const results: { orderRef: string; status: string; tracking?: { code: string; url: string }[] }[] = [];
  const startedAt = Date.now();

  for (const sessionId of sessionIds.slice(0, MAX_PER_RUN)) {
    // Leave the rest queued rather than being killed mid-item: anything not
    // reached keeps its place and is picked up on the next run.
    if (Date.now() - startedAt > RUN_BUDGET_MS) break;
    const record = await kv.get<PendingShipment>(recordKey(sessionId));
    if (!record) {
      // The record expired before the shipment was ever confirmed. Drop it so
      // the queue does not grow without bound.
      await kv.srem(PENDING_SET, sessionId);
      continue;
    }
    if (record.trackingCollected) {
      await kv.srem(PENDING_SET, sessionId);
      continue;
    }

    const attempts = record.attempts ?? 0;
    const age = record.createdAt ? Date.now() - record.createdAt : 0;
    if (attempts >= MAX_ATTEMPTS || age > STALE_MS) {
      // Leaving it queued would starve every newer order behind it, because the
      // run only ever looks at the first MAX_PER_RUN members of the set.
      await kv.srem(PENDING_SET, sessionId);
      await kv.del(recordKey(sessionId)).catch(() => { /* TTL will collect it */ });
      console.warn(`[vinsfins dpd:sync] giving up on ${record.orderRef} after ${attempts} attempts`);
      results.push({ orderRef: record.orderRef, status: "abandoned" });
      continue;
    }

    try {
      const shipment = await getShipment(record.reference);
      const codes = shipment?.trackingCodes ?? [];

      // Wait for a number for every parcel: marking the order done after the
      // first one would leave a two-parcel order half-tracked forever. Past
      // half the attempt budget (a week), keep whatever DPD has rather than
      // ending up with nothing.
      const expected = Math.max(1, record.parcels || 1);
      const complete = codes.length >= expected || attempts >= Math.floor(MAX_ATTEMPTS / 2);

      if (codes.length === 0 || !complete) {
        await bumpAttempts(sessionId, record, attempts);
        results.push({
          orderRef: record.orderRef,
          status: `waiting ${codes.length}/${expected} (${shipment?.state ?? "unknown"})`,
        });
        continue;
      }
      // Keep the record: the numbers it now holds are the only copy, and the
      // TTL is what eventually collects it.
      await kv.set(
        recordKey(sessionId),
        { ...record, trackingCodes: codes, trackingCollected: true },
        { ex: RECORD_TTL_SECONDS },
      );
      // Past this point nothing may throw: the catch below would re-persist the
      // stale record and undo the mark just written.
      await kv.srem(PENDING_SET, sessionId).catch(() => { /* flagged collected already */ });
      results.push({
        orderRef: record.orderRef,
        status: "tracking collected",
        tracking: codes.map((code) => ({ code, url: trackingUrl(code) })),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[vinsfins dpd:sync] ${record.orderRef}: ${message}`);
      await bumpAttempts(sessionId, record, attempts).catch(() => { /* best effort */ });
      results.push({ orderRef: record.orderRef, status: "error" });
    }
  }

  return NextResponse.json({ checked: results.length, queued: sessionIds.length, results });
}

async function bumpAttempts(sessionId: string, record: PendingShipment, attempts: number): Promise<void> {
  await kv.set(recordKey(sessionId), { ...record, attempts: attempts + 1 }, { ex: RECORD_TTL_SECONDS });
}
