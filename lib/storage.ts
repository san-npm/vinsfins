import { list, del } from "@vercel/blob";
import { kv } from "@vercel/kv";

// Admin-editable datasets (wines, menu, content) live in Vercel KV.
// KV is server-side-only — no public URL that could leak internal fields
// like stock, supplier, or barcode. Legacy writes went to a public Vercel
// Blob; the migration path below moves the most recent blob into KV once
// and then deletes the exact blob URLs that were migrated (not every blob
// under the prefix, which would race with concurrent writes).

const KV_PREFIX = "data:";
const MIGRATED_PREFIX = "migrated:";
const LOCK_TTL_SECONDS = 15;

async function acquireLock(key: string): Promise<boolean> {
  try {
    const lockKey = `lock:migrate:${key}`;
    const got = await kv.setnx(lockKey, Date.now());
    if (got) await kv.expire(lockKey, LOCK_TTL_SECONDS);
    return Boolean(got);
  } catch {
    return false;
  }
}

async function migrateLegacyBlob(key: string): Promise<unknown | null> {
  if (!(await acquireLock(key))) {
    // Another request is migrating; re-read KV after a tick.
    await new Promise((r) => setTimeout(r, 250));
    try {
      const cached = await kv.get<unknown>(`${KV_PREFIX}${key}`);
      if (cached !== null && cached !== undefined) return cached;
    } catch {
      // fall through
    }
    return null;
  }

  try {
    const { blobs } = await list({ prefix: `vinsfins/${key}` });
    if (!blobs.length) return null;
    const sorted = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
    const latest = sorted[0];
    const res = await fetch(latest.url);
    if (!res.ok) return null;
    const data = await res.json();
    // Move to KV first.
    await kv.set(`${KV_PREFIX}${key}`, data);
    // Delete only the exact URLs we saw in this snapshot — a writer that
    // creates a new blob between list() and del() keeps that blob intact.
    await Promise.all(
      sorted.map((b) => del(b.url).catch(() => undefined)),
    );
    return data;
  } catch {
    return null;
  }
}

export async function loadData(key: string, fallback: unknown): Promise<unknown> {
  try {
    const cached = await kv.get<unknown>(`${KV_PREFIX}${key}`);
    if (cached !== null && cached !== undefined) return cached;
    // Once the migration sentinel is set, never call Blob list() again for
    // this key. Without this, every public read of a never-edited key
    // (no KV value) burned an Advanced Operation per request.
    if (await kv.get(`${MIGRATED_PREFIX}${key}`)) return fallback;
  } catch {
    // KV outage: do not fall through to Blob — that path would burn
    // Advanced Operations on traffic spikes when KV is the actual problem.
    return fallback;
  }
  const migrated = await migrateLegacyBlob(key);
  try {
    await kv.set(`${MIGRATED_PREFIX}${key}`, 1);
  } catch {
    // Sentinel write failed; we'll retry on the next miss. Worst case is
    // one extra list() call.
  }
  return migrated !== null ? migrated : fallback;
}

export async function saveData(key: string, data: unknown): Promise<void> {
  // KV is the source of truth. We no longer write to Blob at all; legacy
  // blobs are cleaned up once and then the sentinel suppresses further
  // list() calls so sensitive fields (stock, supplier, barcode) stop
  // living on a public CDN without re-running cleanup on every save.
  await kv.set(`${KV_PREFIX}${key}`, data);
  let migrated = false;
  try {
    migrated = Boolean(await kv.get(`${MIGRATED_PREFIX}${key}`));
  } catch {}
  if (migrated) return;
  try {
    const { blobs } = await list({ prefix: `vinsfins/${key}` });
    if (blobs.length > 0) {
      await Promise.all(blobs.map((b) => del(b.url).catch(() => undefined)));
    }
    await kv.set(`${MIGRATED_PREFIX}${key}`, 1);
  } catch {
    // Cleanup will retry on the next save until it succeeds and sets
    // the sentinel.
  }
}
