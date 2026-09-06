import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { kv } from "@vercel/kv";
import { verifyToken } from "@/lib/admin-auth";
import { getShipment, isDpdConfigured, trackingUrl } from "@/lib/dpd-api";
import { sendTrackingEmail } from "@/lib/email";

/**
 * Send tracking numbers to customers once DPD has issued them.
 *
 * A DPD draft has no parcel number until the shop confirms and pays for it in
 * Web Parcel, so there is nothing to email at booking time. This job walks the
 * orders waiting on a number and sends each one as it appears.
 *
 * Runs either from the admin panel (session cookie) or from Vercel Cron, which
 * authenticates with `Authorization: Bearer $CRON_SECRET`.
 */

// Each item costs a Packlink round trip bounded at 8s plus KV and an email.
// The wall-clock guard below is what actually keeps the run inside this.
export const maxDuration = 60;

const PENDING_SET = "dpd:pending";
const recordKey = (sessionId: string) => `dpd:${sessionId}`;

/**
 * Each item costs one Packlink round trip plus possibly an email send. Kept
 * well inside the serverless function budget: a backlog drains over successive
 * runs rather than timing out and losing the whole run.
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
  email: string | null;
  parcels: number;
  trackingSent: boolean;
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
    // ever gets a tracking email. Say so in the logs rather than 401ing mutely.
    if (!process.env.CRON_SECRET) {
      console.error("[vinsfins dpd:sync] CRON_SECRET is not set — scheduled tracking emails cannot run");
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDpdConfigured()) {
    return NextResponse.json({ error: "DPD_API_KEY is not configured" }, { status: 503 });
  }

  const sessionIds = (await kv.smembers<string[]>(PENDING_SET)) ?? [];
  const results: { orderRef: string; status: string }[] = [];
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
    if (record.trackingSent) {
      await kv.srem(PENDING_SET, sessionId);
      continue;
    }

    const attempts = record.attempts ?? 0;
    const age = record.createdAt ? Date.now() - record.createdAt : 0;
    if (attempts >= MAX_ATTEMPTS || age > STALE_MS) {
      // Leaving it queued would starve every newer order behind it, because the
      // run only ever looks at the first MAX_PER_RUN members of the set.
      await kv.srem(PENDING_SET, sessionId);
      // Nothing will look at this record again, and it holds the customer's
      // email address, so drop it rather than letting it sit out its TTL.
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
      // half the attempt budget (a week), send whatever DPD has rather than
      // leaving the customer with nothing.
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
      if (!record.email) {
        await kv.srem(PENDING_SET, sessionId);
        await kv.del(recordKey(sessionId)).catch(() => { /* TTL will collect it */ });
        results.push({ orderRef: record.orderRef, status: "no customer email" });
        continue;
      }

      // Count the attempt BEFORE sending. If the process dies between the send
      // and the cleanup, the next run retries at most MAX_ATTEMPTS times rather
      // than re-sending the same email on every run forever.
      await bumpAttempts(sessionId, record, attempts);

      const sent = await sendTrackingEmail({
        to: record.email,
        orderRef: record.orderRef,
        trackingLinks: codes.map((code) => ({ code, url: trackingUrl(code) })),
      });
      if (!sent) {
        // Otherwise a permanently failing address is indistinguishable from
        // "the shop never confirmed the draft" when the budget runs out.
        console.error(
          `[vinsfins dpd:sync] tracking email refused for ${record.orderRef} (attempt ${attempts + 1}/${MAX_ATTEMPTS})`,
        );
        results.push({ orderRef: record.orderRef, status: "email failed, will retry" });
        continue;
      }

      // Mark sent BEFORE cleaning up: if the delete fails, the flag still stops
      // the next run re-sending the same tracking email.
      await kv.set(recordKey(sessionId), { ...record, trackingSent: true }, { ex: RECORD_TTL_SECONDS });
      // Past this point nothing may throw: the catch below would re-persist the
      // stale record with trackingSent false and undo the mark just written.
      await kv.srem(PENDING_SET, sessionId).catch(() => { /* flagged sent already */ });
      // Then drop the record entirely rather than letting it sit out its TTL:
      // it holds the customer's email address and has no further purpose.
      await kv.del(recordKey(sessionId)).catch(() => { /* flag above already guards */ });
      results.push({ orderRef: record.orderRef, status: "tracking sent" });
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
