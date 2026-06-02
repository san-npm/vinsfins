import type { MetadataRoute } from "next";
import { SHOP_ENABLED } from "@/lib/flags";
import { getPublicWines } from "@/lib/catalogue";

const SITE_URL = "https://www.vinsfins.lu";
const locales = ["fr", "en", "de", "lb"] as const;

function localeUrls(path: string) {
  const byLocale = Object.fromEntries(
    locales.map((l) => [l, l === "fr" ? `${SITE_URL}${path}` : `${SITE_URL}/${l}${path}`])
  );
  return { ...byLocale, "x-default": `${SITE_URL}${path}` };
}

// Pin lastmod per content type to the date the underlying content actually
// changed, NOT the build date. Stamping `new Date()` on every page on every
// deploy makes Google see "all pages changed today" — the trust signal then
// degrades because the freshness claim never correlates with real edits.
// Bump these only when the corresponding content actually changes.
const LAST_MODIFIED = {
  home: "2026-04-27",     // last hero/copy revision
  wines: "2026-03-25",    // last catalog enrichment (data/wines.ts header)
  menu: "2026-03-25",     // last menu edit
  shop: "2026-04-27",     // last shop schema/copy update
  about: "2026-03-20",
  contact: "2026-03-20",
  legal: "2026-01-01",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { path: "/", priority: 1.0, freq: "weekly" as const, lm: LAST_MODIFIED.home },
    { path: "/vins", priority: 0.9, freq: "weekly" as const, lm: LAST_MODIFIED.wines },
    { path: "/vins/luxembourg", priority: 0.85, freq: "weekly" as const, lm: LAST_MODIFIED.wines },
    { path: "/carte", priority: 0.9, freq: "weekly" as const, lm: LAST_MODIFIED.menu },
    { path: "/boutique", priority: 0.8, freq: "weekly" as const, lm: LAST_MODIFIED.shop },
    { path: "/a-propos", priority: 0.6, freq: "monthly" as const, lm: LAST_MODIFIED.about },
    { path: "/contact", priority: 0.7, freq: "monthly" as const, lm: LAST_MODIFIED.contact },
    { path: "/legal/cgv", priority: 0.3, freq: "yearly" as const, lm: LAST_MODIFIED.legal },
    { path: "/legal/confidentialite", priority: 0.3, freq: "yearly" as const, lm: LAST_MODIFIED.legal },
    { path: "/legal/remboursement", priority: 0.3, freq: "yearly" as const, lm: LAST_MODIFIED.legal },
  ];

  const pages: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const l of locales) {
      pages.push({
        url: l === "fr" ? `${SITE_URL}${page.path}` : `${SITE_URL}/${l}${page.path}`,
        lastModified: page.lm,
        changeFrequency: page.freq,
        priority: page.priority,
        alternates: { languages: localeUrls(page.path) },
      });
    }
  }

  // Source from the SAME resolver the detail pages use (`getPublicWines`) so the
  // sitemap can never advertise a URL that resolves to a noindex/notFound page.
  // The wine-bar MENU (/vins) indexes every available wine — the full cellar,
  // priced or not. The online SHOP (/boutique) only lists wines with a real
  // retail price (priceShop > 0).
  const publicWines = await getPublicWines();

  for (const wine of publicWines) {
    for (const l of locales) {
      pages.push({
        url: l === "fr" ? `${SITE_URL}/vins/${wine.id}` : `${SITE_URL}/${l}/vins/${wine.id}`,
        lastModified: LAST_MODIFIED.wines,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: localeUrls(`/vins/${wine.id}`) },
      });
      // Buy pages only for wines actually on sale online, and only once the
      // shop is live (otherwise /boutique/[id] canonicalises to /vins/[id]).
      if (SHOP_ENABLED && wine.priceShop > 0) {
        pages.push({
          url: l === "fr" ? `${SITE_URL}/boutique/${wine.id}` : `${SITE_URL}/${l}/boutique/${wine.id}`,
          lastModified: LAST_MODIFIED.shop,
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: { languages: localeUrls(`/boutique/${wine.id}`) },
        });
      }
    }
  }

  return pages;
}
