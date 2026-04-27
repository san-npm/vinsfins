import type { MetadataRoute } from "next";
import { wines } from "@/data/wines";

const SITE_URL = "https://www.vinsfins.lu";
const locales = ["fr", "en", "de", "lb"] as const;

function localeUrls(path: string) {
  const byLocale = Object.fromEntries(
    locales.map((l) => [l, l === "fr" ? `${SITE_URL}${path}` : `${SITE_URL}/${l}${path}`])
  );
  return { ...byLocale, "x-default": `${SITE_URL}${path}` };
}

// Build-time freshness for non-legal sections (every deploy refreshes the
// catalog and content). Legal pages stay pinned to their last review date.
const BUILD_DATE = new Date().toISOString().slice(0, 10);
const LAST_MODIFIED = {
  home: BUILD_DATE,
  wines: BUILD_DATE,
  menu: BUILD_DATE,
  shop: BUILD_DATE,
  about: BUILD_DATE,
  contact: BUILD_DATE,
  legal: "2026-01-01",
};

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Only emit wine URLs that actually render — `/vins/[id]` pages are
  // static-param'd on wines with `priceShop > 0 && isAvailable`, so any
  // URL outside that set 301-redirects to a locale prefix and 404s.
  // Emitting them wastes crawl budget and creates soft-404 warnings in
  // Google Search Console.
  const indexableWines = wines.filter((w) => w.isAvailable && w.priceShop > 0);

  for (const wine of indexableWines) {
    for (const l of locales) {
      pages.push({
        url: l === "fr" ? `${SITE_URL}/vins/${wine.id}` : `${SITE_URL}/${l}/vins/${wine.id}`,
        lastModified: LAST_MODIFIED.wines,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: localeUrls(`/vins/${wine.id}`) },
      });
      pages.push({
        url: l === "fr" ? `${SITE_URL}/boutique/${wine.id}` : `${SITE_URL}/${l}/boutique/${wine.id}`,
        lastModified: LAST_MODIFIED.shop,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: { languages: localeUrls(`/boutique/${wine.id}`) },
      });
    }
  }

  return pages;
}
