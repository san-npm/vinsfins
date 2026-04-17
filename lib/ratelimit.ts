import { kv } from "@vercel/kv";
import type { NextRequest } from "next/server";

/**
 * Extract the client IP. On Vercel, `x-real-ip` is always set by the edge
 * to the authenticated client IP and cannot be spoofed by the client.
 * `x-forwarded-for` is only honoured as a fallback for local dev because
 * a client-supplied value would allow bypassing the rate limiter.
 */
export function getClientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  // Fallback for local development / test runs only.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

/**
 * Fixed-window rate limit. Returns `{ ok, ... }`.
 *
 * When `failClosed` is true (default for security-critical paths), a KV
 * outage returns `ok: false` — safer for stock-mutating endpoints than
 * silently disabling protection. Callers that want fail-open behaviour
 * for UX-only throttling can pass `failClosed: false`.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  opts: { failClosed?: boolean } = {},
): Promise<{ ok: boolean; count: number; retryAfter: number; unavailable?: boolean }> {
  const failClosed = opts.failClosed ?? true;
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const redisKey = `rl:${key}:${bucket}`;
  try {
    const count = await kv.incr(redisKey);
    if (count === 1) await kv.expire(redisKey, windowSeconds + 1);
    if (count > limit) {
      const retryAfter = (bucket + 1) * windowSeconds - Math.floor(Date.now() / 1000);
      return { ok: false, count, retryAfter: Math.max(1, retryAfter) };
    }
    return { ok: true, count, retryAfter: 0 };
  } catch {
    return { ok: !failClosed, count: 0, retryAfter: failClosed ? 30 : 0, unavailable: true };
  }
}
