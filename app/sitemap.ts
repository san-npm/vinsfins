import type { MetadataRoute } from "next";
import { wines } from "@/data/wines";

const SITE_URL = "https://vinsfins.lu";
const locales = ["fr", "en", "de", "lb"] as const;

function localeUrls(path: string) {
  return Object.fromEntries(
    locales.map((l) => [l, l === "fr" ? `${SITE_URL}${path}` : `${SITE_URL}/${l}${path}`])
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages = [
    { path: "/", priority: 1.0, freq: "weekly" as const },
    { path: "/vins", priority: 0.9, freq: "weekly" as const },
    { path: "/carte", priority: 0.9, freq: "weekly" as const },
    { path: "/boutique", priority: 0.8, freq: "weekly" as const },
    { path: "/a-propos", priority: 0.6, freq: "monthly" as const },
    { path: "/contact", priority: 0.7, freq: "monthly" as const },
  ];

  const pages: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const l of locales) {
      pages.push({
        url: l === "fr" ? `${SITE_URL}${page.path}` : `${SITE_URL}/${l}${page.path}`,
        lastModified: now,
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
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: localeUrls(`/vins/${wine.id}`) },
      });
    }
  }

  return pages;
}
