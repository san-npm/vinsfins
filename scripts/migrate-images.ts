/**
 * Migrate all wine images from external URLs to Vercel Blob.
 * Run with: npx tsx scripts/migrate-images.ts
 *
 * Requires BLOB_READ_WRITE_TOKEN env var.
 */
import { put } from "@vercel/blob";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const WINES_FILE = join(__dirname, "../data/wines.ts");
const BATCH_SIZE = 10; // concurrent downloads

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; VinsFins/1.0)" },
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn(`  SKIP (HTTP ${res.status}): ${url}`);
      return null;
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      console.warn(`  SKIP (not image: ${contentType}): ${url}`);
      return null;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.warn(`  SKIP (error): ${url}`, (err as Error).message);
    return null;
  }
}

function getExtension(url: string): string {
  const path = new URL(url).pathname.toLowerCase();
  if (path.endsWith(".png")) return "png";
  if (path.endsWith(".webp")) return "webp";
  if (path.endsWith(".gif")) return "gif";
  return "jpg";
}

async function uploadToBlob(wineId: string, imageBuffer: Buffer, ext: string): Promise<string> {
  const blob = await put(`vinsfins/images/${wineId}.${ext}`, imageBuffer, {
    access: "public",
    addRandomSuffix: false, // Deterministic URL for images is fine
    cacheControlMaxAge: 31536000, // 1 year cache
    contentType: ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg",
  });
  return blob.url;
}

async function processBatch(batch: { id: string; image: string }[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  await Promise.all(
    batch.map(async ({ id, image }) => {
      const buf = await downloadImage(image);
      if (buf) {
        const ext = getExtension(image);
        const blobUrl = await uploadToBlob(id, buf, ext);
        results.set(id, blobUrl);
        console.log(`  OK: ${id} → ${blobUrl.slice(0, 60)}...`);
      }
    })
  );
  return results;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is required. Run: vercel env pull .env.local");
    process.exit(1);
  }

  // Parse wine IDs and image URLs from the TS file
  const content = readFileSync(WINES_FILE, "utf-8");
  const idRegex = /id:\s*'([^']+)'/g;
  const imageRegex = /image:\s*'([^']+)'/g;

  const ids: string[] = [];
  const images: string[] = [];
  let m;
  while ((m = idRegex.exec(content)) !== null) ids.push(m[1]);
  while ((m = imageRegex.exec(content)) !== null) images.push(m[1]);

  if (ids.length !== images.length) {
    console.error(`Mismatch: ${ids.length} IDs vs ${images.length} images`);
    process.exit(1);
  }

  console.log(`Migrating ${ids.length} images to Vercel Blob...\n`);

  const urlMap = new Map<string, string>();
  const items = ids.map((id, i) => ({ id, image: images[i] }));

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(items.length / BATCH_SIZE)} (${i + 1}-${Math.min(i + BATCH_SIZE, items.length)}):`);
    const results = await processBatch(batch);
    results.forEach((url, id) => urlMap.set(id, url));
  }

  console.log(`\nUploaded: ${urlMap.size}/${ids.length}`);

  // Update the wines.ts file — replace image URLs
  let updated = content;
  let replacements = 0;
  for (const [id, blobUrl] of urlMap) {
    // Find the image URL for this specific wine entry
    const idx = updated.indexOf(`id: '${id}'`);
    if (idx === -1) continue;
    // Find the next image: '...' after this id
    const afterId = updated.slice(idx);
    const imgMatch = afterId.match(/image:\s*'([^']+)'/);
    if (imgMatch && imgMatch[1] !== blobUrl) {
      updated = updated.slice(0, idx) + afterId.replace(`image: '${imgMatch[1]}'`, `image: '${blobUrl}'`);
      replacements++;
    }
  }

  writeFileSync(WINES_FILE, updated);
  console.log(`Updated ${replacements} image URLs in wines.ts`);

  // Report failures
  const failed = ids.filter((id) => !urlMap.has(id));
  if (failed.length > 0) {
    console.log(`\nFailed (${failed.length}):`);
    failed.forEach((id, i) => console.log(`  ${id}: ${images[ids.indexOf(id)]}`));
  }
}

main().catch(console.error);
