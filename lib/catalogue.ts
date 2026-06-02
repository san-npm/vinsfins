import { wines as staticWines, type Wine } from "@/data/wines";

/**
 * Single source of truth for the PUBLIC wine catalogue.
 *
 * While the shop is disabled (catalogue mode) the curated, version-controlled
 * `data/wines.ts` bundle IS the catalogue. We deliberately do NOT read KV here:
 * live KV holds a partial/legacy dataset whose IDs are disjoint from the static
 * bundle, so a KV-first read made every static (and sitemap/prerendered) wine
 * resolve to `notFound()` → `robots: noindex` — deindexing the whole catalogue.
 * The sitemap, `generateStaticParams`, the public API and the detail pages must
 * all agree on ONE source.
 *
 * When the shop is switched back on, repopulate KV from the real inventory
 * FIRST, then reads fall back to KV-first so admin stock/price edits propagate
 * without a redeploy. `loadData` is imported lazily so catalogue mode never
 * pulls in the KV/Blob clients.
 */
export function catalogueWines(): Wine[] {
  return staticWines.filter((w) => w.isAvailable);
}

export async function getPublicWines(): Promise<Wine[]> {
  // vinsfins is statically driven: data/wines.ts is the single source of truth
  // for the public catalogue, in catalogue OR shop mode. We deliberately never
  // read the shared KV here — it belongs to the sister site (grocerie), and a
  // KV-first read would reintroduce the disjoint-ID → notFound() → noindex bug
  // whenever KV and the static bundle diverge. Stock COUNTS still live in KV
  // (see lib/stock.ts); only the catalogue LIST is static.
  return catalogueWines();
}

export async function findPublicWine(id: string): Promise<Wine | null> {
  const all = await getPublicWines();
  return all.find((w) => w.id === id) ?? null;
}
