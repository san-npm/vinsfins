/**
 * Shared Product JSON-LD builder.
 *
 * Why centralised: four call sites (/vins, /vins/[id], /boutique/[id], the
 * /vins ItemList) used to emit slightly different Product markup. Google
 * Search Console flagged 17k field-level issues across 730 wines because of
 * the drift. Keeping the shape in one place prevents re-divergence.
 */
import type { Wine } from "@/data/wines";
import { SITE_URL, wineCategory, type Locale } from "@/lib/i18n";

type Country = "LU" | "FR" | "DE" | "BE";

// Single-bottle (≤2kg) POST Luxembourg rate per country. Mirrors
// getShippingCents() in app/api/checkout/route.ts:30; if that tier changes,
// update here too.
const SHIPPING_RATE_EUR: Record<Country, number> = {
  LU: 7,
  FR: 12,
  DE: 12,
  BE: 12,
};

const SHIPPING_COUNTRIES: Country[] = ["LU", "FR", "DE", "BE"];

/**
 * 14-day return window per /legal/remboursement. Customer bears return
 * postage. Full refund via original payment method.
 */
export const MERCHANT_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: SHIPPING_COUNTRIES,
  returnPolicyCountry: "LU",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnShippingFees",
  refundType: "https://schema.org/FullRefund",
} as const;

function shippingDetailsFor(country: Country) {
  return {
    "@type": "OfferShippingDetails",
    shippingDestination: { "@type": "DefinedRegion", addressCountry: country },
    shippingRate: {
      "@type": "MonetaryAmount",
      value: SHIPPING_RATE_EUR[country].toString(),
      currency: "EUR",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 7,
        unitCode: "DAY",
      },
    },
  };
}

/** Per-country shipping entries — one OfferShippingDetails per destination. */
export function buildShippingDetails() {
  return SHIPPING_COUNTRIES.map(shippingDetailsFor);
}

/**
 * Brand name resolution. `wine.region` is empty for ~72 entries (beers,
 * cidres, uncategorised). Fall back to country, then to "Vins Fins" as a
 * last resort so `brand.name` is never empty — Google flags missing
 * brand.name as a warning.
 */
function resolveBrandName(wine: Wine): string {
  if (wine.region && wine.region.trim()) return wine.region.trim();
  if (wine.country && wine.country.trim()) return wine.country.trim();
  return "Vins Fins";
}

function isShippable(wine: Wine): boolean {
  return wine.priceShop > 0 && wine.isAvailable;
}

type OfferKind = "glass" | "bottle" | "shop";

function buildOffer(wine: Wine, kind: OfferKind) {
  const base = {
    "@type": "Offer" as const,
    priceCurrency: "EUR",
    itemCondition: "https://schema.org/NewCondition",
  };

  if (kind === "shop") {
    return {
      ...base,
      name: "Boutique en ligne",
      price: wine.priceShop.toString(),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Vins Fins",
        url: SITE_URL,
      },
      shippingDetails: buildShippingDetails(),
      hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
    };
  }

  // Restaurant offers (by the glass / by the bottle on-premise) are not
  // shippable. Marking them InStoreOnly with areaServed tells Google they're
  // dine-in, which is the documented way to omit shippingDetails and
  // hasMerchantReturnPolicy without triggering Merchant Listings warnings.
  const restaurantAvailability = wine.isAvailable
    ? "https://schema.org/InStoreOnly"
    : "https://schema.org/OutOfStock";

  return {
    ...base,
    name: kind === "glass" ? "Au verre" : "Bouteille (restaurant)",
    price: (kind === "glass" ? wine.priceGlass : wine.priceBottle).toString(),
    availability: restaurantAvailability,
    areaServed: { "@type": "Place", name: "Vins Fins, Grund, Luxembourg" },
    seller: {
      "@type": "Restaurant",
      name: "Vins Fins",
      url: SITE_URL,
    },
  };
}

/**
 * On-premise page (/vins/[id]): emits glass + bottle + shop offers. Only the
 * shop offer carries shippingDetails/return policy — restaurant offers are
 * InStoreOnly so Google accepts them without shipping metadata.
 *
 * Shop page (/boutique/[id]): emits only the shop offer.
 */
export type ProductVariant = "menu" | "shop";

interface BuildProductOptions {
  wine: Wine;
  locale: Locale;
  /** Canonical URL for the product page. */
  url: string;
  variant: ProductVariant;
}

export function buildWineProduct({ wine, locale, url, variant }: BuildProductOptions) {
  const offers: ReturnType<typeof buildOffer>[] = [];

  if (variant === "shop") {
    // Shop pages are pre-filtered to shippable wines by generateStaticParams
    // in app/boutique/[id]/layout.tsx. If a non-shippable wine somehow lands
    // here we emit a Product with no offers — a valid Schema.org Product
    // that will simply not surface in merchant-listing rich results — rather
    // than fabricating a price-0 Offer that Google would flag as invalid.
    if (isShippable(wine)) offers.push(buildOffer(wine, "shop"));
  } else {
    if (wine.priceGlass > 0) offers.push(buildOffer(wine, "glass"));
    if (wine.priceBottle > 0) offers.push(buildOffer(wine, "bottle"));
    if (isShippable(wine)) offers.push(buildOffer(wine, "shop"));
  }

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: wine.name,
    description:
      wine.description[locale]?.trim() ||
      wine.description.fr?.trim() ||
      wine.name,
    ...(wine.image?.trim() ? { image: [wine.image] } : {}),
    url,
    sku: wine.id,
    mpn: wine.barcode || wine.id,
    brand: { "@type": "Brand", name: resolveBrandName(wine) },
    category: wineCategory[wine.category]?.[locale] || wine.category,
    material: wine.grape,
    countryOfOrigin: { "@type": "Country", name: wine.country },
    offers,
    additionalProperty: [
      ...(wine.isOrganic
        ? [{ "@type": "PropertyValue", name: "Certification", value: "Bio" }]
        : []),
      ...(wine.isBiodynamic
        ? [{ "@type": "PropertyValue", name: "Certification", value: "Biodynamie" }]
        : []),
      ...(wine.isNatural
        ? [{ "@type": "PropertyValue", name: "Certification", value: "Vin Naturel" }]
        : []),
    ],
  };

  // Only attach gtin13 when we have a plausibly-valid 13-digit barcode.
  // Wines missing barcode (5/730) still emit valid Product markup — they
  // just won't appear in GTIN-keyed price comparison surfaces.
  if (wine.barcode && /^\d{13}$/.test(wine.barcode)) {
    product.gtin13 = wine.barcode;
  }

  return product;
}

/**
 * Compact Product summary for ItemList's itemListElement. Nested Products
 * still need image + offer shipping/return for Google's Merchant Listings
 * validator to be happy. URL is caller-supplied so ItemList and canonical
 * pages agree.
 */
export function buildListProduct({ wine, locale, url }: { wine: Wine; locale: Locale; url: string }) {
  const useShop = isShippable(wine);
  const offer = useShop
    ? buildOffer(wine, "shop")
    : buildOffer(wine, wine.priceBottle > 0 ? "bottle" : "glass");

  const product: Record<string, unknown> = {
    "@type": "Product",
    name: wine.name,
    description:
      wine.description[locale]?.trim() ||
      wine.description.fr?.trim() ||
      wine.name,
    ...(wine.image?.trim() ? { image: [wine.image] } : {}),
    url,
    sku: wine.id,
    brand: { "@type": "Brand", name: resolveBrandName(wine) },
    offers: offer,
  };

  if (wine.barcode && /^\d{13}$/.test(wine.barcode)) {
    product.gtin13 = wine.barcode;
  }

  return product;
}

/**
 * Escapes inline-<script> hazards so the output can be safely emitted
 * inside `<script type="application/ld+json">…</script>`.
 *
 * - `<` → `<`: without a literal `<`, the HTML tokeniser cannot open
 *   a new tag or close the current <script>, so </script>-breakout
 *   attacks are impossible.
 * - U+2028 / U+2029: Node 10+ JSON.stringify already escapes these per the
 *   2019 ECMAScript spec, but we re-escape defensively so the module stays
 *   safe if the runtime or a future serialiser regresses.
 */
export function jsonLdToScript(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/ /g, "\\u2028")
    .replace(/ /g, "\\u2029");
}
