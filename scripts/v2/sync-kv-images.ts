/**
 * Syncs image URLs from data/wines.ts into the Vercel KV `data:wines` snapshot.
 *
 * Why: the public site reads wines via /api/public/wines → KV. Admin edits
 * (stock, prices) live only in KV. This script reads the current KV snapshot,
 * overlays the image field from data/wines.ts (by wine id), and writes back.
 * Any admin-edited non-image fields are preserved. Wines present in KV but
 * missing from data/wines.ts are kept unchanged. Wines in data/wines.ts but
 * missing from KV are added.
 *
 * Run: npx tsx -r dotenv/config scripts/v2/sync-kv-images.ts
 * (or: set -a; source .env.local; set +a; npx tsx scripts/v2/sync-kv-images.ts)
 */
import { kv } from '@vercel/kv';
import { wines as localWines } from '../../data/wines';

const KV_KEY = 'data:wines';

async function main() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error('KV_REST_API_URL and KV_REST_API_TOKEN required in env');
    process.exit(1);
  }

  const kvWines = (await kv.get<any[]>(KV_KEY)) ?? [];
  console.log(`KV holds ${kvWines.length} wines; data/wines.ts has ${localWines.length}`);

  const localById = new Map(localWines.map((w) => [w.id, w]));
  const kvById = new Map(kvWines.map((w) => [w.id, w]));

  let imagesUpdated = 0;
  let unchanged = 0;
  const merged: any[] = [];

  // Start from KV set (preserves admin edits), overlay image from local
  for (const kvWine of kvWines) {
    const local = localById.get(kvWine.id);
    if (local && local.image && local.image !== kvWine.image) {
      merged.push({ ...kvWine, image: local.image });
      imagesUpdated++;
    } else {
      merged.push(kvWine);
      unchanged++;
    }
  }

  // Add wines in local but not in KV
  let added = 0;
  for (const local of localWines) {
    if (!kvById.has(local.id)) {
      merged.push(local);
      added++;
    }
  }

  console.log(`images updated: ${imagesUpdated}`);
  console.log(`unchanged:      ${unchanged}`);
  console.log(`added new:      ${added}`);
  console.log(`total written:  ${merged.length}`);

  await kv.set(KV_KEY, merged);
  console.log('✓ KV updated');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
