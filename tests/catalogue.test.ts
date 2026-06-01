/**
 * Regression guard for the public catalogue resolver.
 *
 * Incident (June 2026): every wine product page rendered `robots: noindex`.
 * Root cause: detail pages + the public API resolved wines KV-first via
 * `loadData()`, but live KV held a 122-wine dataset whose IDs were DISJOINT
 * from the curated static bundle (`data/wines.ts`) and the sitemap. So every
 * wine the sitemap/prerender advertised resolved to `null` → `notFound()` →
 * `noindex` soft-404, deindexing the entire product catalogue.
 *
 * These tests pin the contract: while the shop is disabled (catalogue mode),
 * the public catalogue IS the curated static bundle, and every wine the sitemap
 * advertises resolves to a real, indexable page — independent of KV.
 */
import { describe, expect, it } from "vitest";
import { wines } from "../data/wines";
import { catalogueWines, getPublicWines, findPublicWine } from "../lib/catalogue";
import { SHOP_ENABLED } from "../lib/flags";

// The exact set the sitemap advertises as indexable wine pages (see app/sitemap.ts).
const sitemapIndexable = wines.filter((w) => w.isAvailable && w.priceShop > 0);

describe("public catalogue resolver (catalogue mode)", () => {
  it("invariants below assume the shop is disabled", () => {
    expect(SHOP_ENABLED).toBe(false);
  });

  it("exposes exactly the available static wines, independent of KV", async () => {
    const pub = await getPublicWines();
    expect(pub).toEqual(catalogueWines());
    expect(pub.length).toBe(wines.filter((w) => w.isAvailable).length);
    expect(pub.every((w) => w.isAvailable)).toBe(true);
  });

  it("resolves EVERY sitemap-indexable wine to a real page (no noindex soft-404)", async () => {
    const unresolved: string[] = [];
    for (const w of sitemapIndexable) {
      const found = await findPublicWine(w.id);
      if (!found || found.id !== w.id) unresolved.push(w.id);
    }
    expect(unresolved).toEqual([]);
    expect(sitemapIndexable.length).toBeGreaterThan(100);
  });

  it("does not expose wines hidden until priced (isAvailable === false)", async () => {
    const hidden = wines.find((w) => !w.isAvailable);
    expect(hidden, "expected at least one hidden wine in data/wines.ts").toBeTruthy();
    if (hidden) expect(await findPublicWine(hidden.id)).toBeNull();
  });

  it("returns null for an unknown slug", async () => {
    expect(await findPublicWine("definitely-not-a-real-wine-slug")).toBeNull();
  });
});
