import { put, list, del } from "@vercel/blob";

export async function loadData(key: string, fallback: unknown): Promise<unknown> {
  try {
    const { blobs } = await list({ prefix: `vinsfins/${key}` });
    if (!blobs.length) return fallback;
    // Sort by uploadedAt descending to always get the most recent blob
    const sorted = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const res = await fetch(sorted[0].url);
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

export async function saveData(key: string, data: unknown): Promise<void> {
  // Delete previous blobs for this key to avoid accumulation
  try {
    const { blobs } = await list({ prefix: `vinsfins/${key}` });
    if (blobs.length > 0) {
      await Promise.all(blobs.map((b) => del(b.url)));
    }
  } catch {
    // Non-critical — old blobs will just accumulate
  }

  await put(`vinsfins/${key}.json`, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: true, // Prevents guessable URLs
    cacheControlMaxAge: 0,
  });
}
