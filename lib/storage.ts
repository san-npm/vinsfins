import { put, list } from "@vercel/blob";

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
  await put(`vinsfins/${key}.json`, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
  });
}
