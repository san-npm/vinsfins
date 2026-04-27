/**
 * Guards against GSC Product-rich-result regressions across all 730 wines.
 *
 * Each failure mode here maps 1:1 to a Google Search Console issue we just
 * fixed; if any assertion fails again, the PR should not merge.
 */
import { describe, expect, it } from "vitest";
import { wines } from "../data/wines";
import {
  MERCHANT_RETURN_POLICY,
  buildListProduct,
  buildShippingDetails,
  buildWineProduct,
  jsonLdToScript,
} from "../lib/structured-data";

type OfferJson = {
  "@type": "Offer";
  price: string;
  priceCurrency: string;
  availability: string;
  shippingDetails?: unknown;
  hasMerchantReturnPolicy?: unknown;
};

type ProductJson = {
  "@type": "Product";
  name: string;
  description: string;
  image: string[];
  url: string;
  sku: string;
  brand: { "@type": "Brand"; name: string };
  offers: OfferJson | OfferJson[];
  gtin13?: string;
};

function normaliseOffers(offers: OfferJson | OfferJson[] | undefined): OfferJson[] {
  if (!offers) return [];
  return Array.isArray(offers) ? offers : [offers];
}

describe("buildShippingDetails", () => {
  it("emits one OfferShippingDetails per shipping country", () => {
    const details = buildShippingDetails();
    const countries = details.map((d) => d.shippingDestination.addressCountry).sort();
    expect(countries).toEqual(["BE", "DE", "FR", "LU"]);
  });

  it("each entry has a numeric shippingRate in EUR and a transit time", () => {
    for (const d of buildShippingDetails()) {
      expect(d.shippingRate.currency).toBe("EUR");
      expect(Number(d.shippingRate.value)).toBeGreaterThan(0);
      expect(d.deliveryTime.transitTime.minValue).toBeGreaterThanOrEqual(1);
      expect(d.deliveryTime.transitTime.maxValue).toBeLessThanOrEqual(7);
    }
  });
});

describe("MERCHANT_RETURN_POLICY", () => {
  it("matches /legal/remboursement (14-day window, customer-paid return)", () => {
    expect(MERCHANT_RETURN_POLICY.merchantReturnDays).toBe(14);
    expect(MERCHANT_RETURN_POLICY.returnFees).toBe("https://schema.org/ReturnShippingFees");
    expect(MERCHANT_RETURN_POLICY.refundType).toBe("https://schema.org/FullRefund");
  });
});

describe("buildWineProduct — shop variant", () => {
  const shippable = wines.filter((w) => w.priceShop > 0 && w.isAvailable);

  it("covers the boutique inventory (non-empty)", () => {
    expect(shippable.length).toBeGreaterThan(0);
  });

  for (const wine of shippable) {
    it(`emits a valid shop Product for ${wine.id}`, () => {
      const product = buildWineProduct({
        wine,
        locale: "fr",
        url: `https://www.vinsfins.lu/boutique/${wine.id}`,
        variant: "shop",
      }) as unknown as ProductJson;

      // Fields GSC flagged as missing
      expect(product.image).toBeInstanceOf(Array);
      expect(product.image[0]).toMatch(/^https?:\/\//);
      expect(product.sku).toBe(wine.id);
      expect(product.brand.name.length).toBeGreaterThan(0);

      const offers = normaliseOffers(product.offers);
      expect(offers.length).toBeGreaterThan(0);
      for (const offer of offers) {
        expect(offer.shippingDetails).toBeDefined();
        expect(offer.hasMerchantReturnPolicy).toBeDefined();
        expect(offer.priceCurrency).toBe("EUR");
        expect(Number(offer.price)).toBeGreaterThan(0);
      }
    });
  }
});

describe("buildWineProduct — menu variant", () => {
  it("never emits zero-price offers (Google rejects offers without a real price)", () => {
    // Current data has priceGlass=0 and priceBottle=0 for every wine —
    // restaurant prices are not in the dataset. The old JSON-LD shipped
    // "Au verre" and "Bouteille" offers at price "0", which contributed
    // to the GSC Merchant Listings issue count. Guard against regression.
    for (const wine of wines.slice(0, 50)) {
      const product = buildWineProduct({
        wine,
        locale: "fr",
        url: `https://www.vinsfins.lu/vins/${wine.id}`,
        variant: "menu",
      }) as unknown as ProductJson;
      for (const offer of normaliseOffers(product.offers)) {
        expect(Number(offer.price), `wine ${wine.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("InStoreOnly restaurant offers carry no shippingDetails / return policy", () => {
    // Data-independent check: build against a synthetic wine that exercises
    // the restaurant (glass/bottle) code path in case priceGlass/priceBottle
    // ever become populated.
    const syntheticWine = {
      ...wines[0],
      priceGlass: 8,
      priceBottle: 42,
      priceShop: 0,
      isAvailable: true,
    };
    const product = buildWineProduct({
      wine: syntheticWine,
      locale: "fr",
      url: `https://www.vinsfins.lu/vins/${syntheticWine.id}`,
      variant: "menu",
    }) as unknown as ProductJson;

    const restaurantOffers = normaliseOffers(product.offers).filter(
      (o) => o.availability === "https://schema.org/InStoreOnly",
    );
    expect(restaurantOffers.length).toBe(2);
    for (const o of restaurantOffers) {
      expect(o.shippingDetails).toBeUndefined();
      expect(o.hasMerchantReturnPolicy).toBeUndefined();
    }
  });

  it("appends a shippable shop offer when priceShop > 0 and available", () => {
    const wine = wines.find((w) => w.priceShop > 0 && w.isAvailable);
    if (!wine) throw new Error("fixture: no shop-available wine");

    const product = buildWineProduct({
      wine,
      locale: "fr",
      url: `https://www.vinsfins.lu/vins/${wine.id}`,
      variant: "menu",
    }) as unknown as ProductJson;

    const shopOffer = normaliseOffers(product.offers).find((o) => o.shippingDetails);
    expect(shopOffer).toBeDefined();
    expect(shopOffer!.hasMerchantReturnPolicy).toBeDefined();
  });
});

describe("buildWineProduct — field coverage across full dataset", () => {
  it("every wine produces a non-empty brand.name (region → country → fallback)", () => {
    for (const wine of wines) {
      const product = buildWineProduct({
        wine,
        locale: "fr",
        url: `https://www.vinsfins.lu/vins/${wine.id}`,
        variant: "menu",
      }) as unknown as ProductJson;
      expect(product.brand.name.length, `wine ${wine.id}`).toBeGreaterThan(0);
    }
  });

  it("emits gtin13 for every wine with a 13-digit barcode", () => {
    const withBarcode = wines.filter((w) => /^\d{13}$/.test(w.barcode));
    expect(withBarcode.length).toBeGreaterThan(0);
    for (const wine of withBarcode) {
      const product = buildWineProduct({
        wine,
        locale: "fr",
        url: `https://www.vinsfins.lu/vins/${wine.id}`,
        variant: "menu",
      }) as unknown as ProductJson;
      expect(product.gtin13, `wine ${wine.id}`).toBe(wine.barcode);
    }
  });

  it("never emits gtin13 for wines with malformed or empty barcodes", () => {
    const bad = wines.filter((w) => !/^\d{13}$/.test(w.barcode));
    for (const wine of bad) {
      const product = buildWineProduct({
        wine,
        locale: "fr",
        url: `https://www.vinsfins.lu/vins/${wine.id}`,
        variant: "menu",
      }) as unknown as ProductJson;
      expect(product.gtin13, `wine ${wine.id}`).toBeUndefined();
    }
  });

  it("every wine image field is a well-formed absolute URL", () => {
    for (const wine of wines) {
      const product = buildWineProduct({
        wine,
        locale: "fr",
        url: `https://www.vinsfins.lu/vins/${wine.id}`,
        variant: "menu",
      }) as unknown as ProductJson;
      expect(product.image[0], `wine ${wine.id}`).toMatch(/^https:\/\//);
    }
  });
});

describe("buildListProduct", () => {
  it("nested products always carry image + sku + brand + a single offer", () => {
    for (const wine of wines.slice(0, 10)) {
      const product = buildListProduct({
        wine,
        locale: "fr",
        url: `https://www.vinsfins.lu/vins/${wine.id}`,
      }) as unknown as ProductJson;

      expect(product.image[0]).toMatch(/^https:\/\//);
      expect(product.sku).toBe(wine.id);
      expect(product.brand.name.length).toBeGreaterThan(0);
      const offers = normaliseOffers(product.offers);
      expect(offers.length).toBe(1);
    }
  });
});

describe("jsonLdToScript", () => {
  it("escapes every `<` so inline JSON-LD cannot open a new tag or close <script>", () => {
    const payload = { note: "</script><script>alert(1)</script>" };
    const out = jsonLdToScript(payload);
    // Every raw `<` is gone — a browser parser cannot start a tag inside
    // the JSON-LD block, which is the actual script-breakout defence.
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script");
    expect(out).toContain("\\u003cscript");
  });

  it("escapes standalone `<` characters in values", () => {
    const out = jsonLdToScript({ s: "a < b" });
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c");
  });
});
