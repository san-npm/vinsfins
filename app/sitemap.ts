import type { MetadataRoute } from "next";
import { wines } from "@/data/wines";

const SITE_URL = "https://vinsfins.lu";
const locales = ["fr", "en", "de", "lb"] as const;

function localeUrls(path: string) {
  const byLocale = Object.fromEntries(
    locales.map((l) => [l, l === "fr" ? `${SITE_URL}${path}` : `${SITE_URL}/${l}${path}`])
  );
  return { ...byLocale, "x-default": `${SITE_URL}${path}` };
}

// Stable lastModified dates per section. Bump these when the underlying
// content actually changes so crawlers don't waste crawl budget re-fetching
// pages that haven't moved.
const LAST_MODIFIED = {
  home: "2026-04-01",
  wines: "2026-04-01",
  menu: "2026-04-01",
  shop: "2026-04-01",
  about: "2026-03-01",
  contact: "2026-03-01",
  legal: "2026-01-01",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "/", priority: 1.0, freq: "weekly" as const, lm: LAST_MODIFIED.home },
    { path: "/vins", priority: 0.9, freq: "weekly" as const, lm: LAST_MODIFIED.wines },
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

  for (const wine of wines) {
    for (const l of locales) {
      pages.push({
        url: l === "fr" ? `${SITE_URL}/vins/${wine.id}` : `${SITE_URL}/${l}/vins/${wine.id}`,
        lastModified: LAST_MODIFIED.wines,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: localeUrls(`/vins/${wine.id}`) },
      });
    }
  }

  return pages;
}
