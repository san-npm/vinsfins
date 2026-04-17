import { list, del } from "@vercel/blob";
import { kv } from "@vercel/kv";

// Admin-editable datasets (wines, menu, content) live in Vercel KV.
// KV is server-side-only — no public URL that could leak internal fields
// like stock, supplier, or barcode. Legacy writes went to a public Vercel
// Blob; the migration path below moves the most recent blob into KV once
// and then deletes the exact blob URLs that were migrated (not every blob
// under the prefix, which would race with concurrent writes).

const KV_PREFIX = "data:";
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
  } catch {
    // KV outage — fall through to fallback
  }
  const migrated = await migrateLegacyBlob(key);
  if (migrated !== null) return migrated;
  return fallback;
}

export async function saveData(key: string, data: unknown): Promise<void> {
  // KV is the source of truth. We no longer write to Blob at all; legacy
  // blobs are cleaned up opportunistically here so sensitive fields
  // (stock, supplier, barcode) stop living on a public CDN.
  await kv.set(`${KV_PREFIX}${key}`, data);
  try {
    const { blobs } = await list({ prefix: `vinsfins/${key}` });
    if (blobs.length > 0) {
      await Promise.all(blobs.map((b) => del(b.url).catch(() => undefined)));
    }
  } catch {
    // Non-critical — cleanup will retry on next save
  }
}
