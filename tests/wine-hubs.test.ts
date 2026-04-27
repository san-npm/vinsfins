import { describe, expect, it } from "vitest";
import sitemap from "../app/sitemap";
import { wines } from "../data/wines";
import { HUBS, HUB_SLUGS, winesForHub } from "../lib/wine-hubs";

describe("HUB_SLUGS — only live hubs are exposed", () => {
  it("currently only /vins/luxembourg is live", () => {
    expect(HUB_SLUGS).toEqual(["luxembourg"]);
  });

  it("every live hub matches at least one real wine", () => {
    for (const slug of HUB_SLUGS) {
      const list = winesForHub(slug);
      expect(list.length, `hub ${slug}`).toBeGreaterThan(0);
    }
  });
});

describe("HUBS config — all four locales populated", () => {
  const locales = ["fr", "en", "de", "lb"] as const;
  for (const slug of Object.keys(HUBS) as (keyof typeof HUBS)[]) {
    for (const locale of locales) {
      it(`${slug}/${locale} has non-empty copy on every field`, () => {
        const hub = HUBS[slug];
        const fields = ["h1", "eyebrow", "intro", "metaTitle", "metaDescription", "ogDescription", "collectionName"] as const;
        for (const field of fields) {
          expect(hub[field][locale].length, `${slug}.${field}.${locale}`).toBeGreaterThan(0);
        }
      });
    }
  }
});

describe("winesForHub — luxembourg", () => {
  it("returns only wines from luxembourg-blanc or luxembourg-rouge sections", () => {
    const list = winesForHub("luxembourg");
    for (const wine of list) {
      expect(["luxembourg-blanc", "luxembourg-rouge"]).toContain(wine.section);
    }
  });

  it("count matches the raw section filter on the full dataset", () => {
    const direct = wines.filter(
      (w) => w.section === "luxembourg-blanc" || w.section === "luxembourg-rouge",
    ).length;
    expect(winesForHub("luxembourg").length).toBe(direct);
  });
});

describe("sitemap — hub routes are emitted per locale", () => {
  it("includes /vins/luxembourg for each locale", () => {
    const urls = new Set(sitemap().map((e) => e.url));
    expect(urls.has("https://www.vinsfins.lu/vins/luxembourg")).toBe(true);
    expect(urls.has("https://www.vinsfins.lu/en/vins/luxembourg")).toBe(true);
    expect(urls.has("https://www.vinsfins.lu/de/vins/luxembourg")).toBe(true);
    expect(urls.has("https://www.vinsfins.lu/lb/vins/luxembourg")).toBe(true);
  });

  it("does NOT include naturel or bio hubs (flags unpopulated — would soft-404)", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.includes("/vins/naturel"))).toBe(false);
    expect(urls.some((u) => u.includes("/vins/bio"))).toBe(false);
  });
});
