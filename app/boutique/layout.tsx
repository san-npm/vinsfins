import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  getLocale,
  getNonce,
  pageMeta,
  SITE_URL,
  localeUrl,
  breadcrumbNames,
  alternateUrls,
} from "@/lib/i18n";
import { wines } from "@/data/wines";
import { SHOP_ENABLED } from "@/lib/flags";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const meta = pageMeta.boutique[locale];

  return {
    title: meta.title,
    description: meta.description,
    // In catalogue mode /boutique mirrors /vins; consolidate to the canonical
    // wine list so search engines don't index a duplicate and don't surface the
    // shop-era "order online" title/description while the shop is off.
    alternates: SHOP_ENABLED
      ? alternateUrls("/boutique", locale)
      : { canonical: localeUrl("/vins", locale) },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${SITE_URL}/boutique`,
    },
  };
}

// Online-shop schema (Store + BuyAction + delivery areas) is only truthful when
// the shop is live. In catalogue mode advertise a neutral wine selection so AI
// engines don't tell users they can order or get delivery.
const storeJsonLd = SHOP_ENABLED
  ? {
      "@context": "https://schema.org",
      "@type": "Store",
      "@id": `${SITE_URL}/boutique/#store`,
      name: "Vins Fins — Boutique en Ligne",
      description:
        "Boutique de vins naturels et bio en ligne. Livraison dans tout le Luxembourg.",
      url: `${SITE_URL}/boutique`,
      currenciesAccepted: "EUR",
      paymentAccepted: "Credit Card",
      areaServed: [
        { "@type": "Country", name: "Luxembourg" },
        { "@type": "Country", name: "France" },
        { "@type": "Country", name: "Germany" },
        { "@type": "Country", name: "Belgium" },
      ],
      potentialAction: { "@type": "BuyAction", target: `${SITE_URL}/boutique` },
    }
  : {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/boutique/#selection`,
      name: "Vins Fins — Sélection de Vins",
      description:
        "Sélection de plus de 730 vins naturels, bio et biodynamiques de 18 pays, à découvrir au bar à vins du Grund, Luxembourg.",
      url: `${SITE_URL}/boutique`,
    };

export default async function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const nonce = await getNonce();
  const shopWines = wines.filter((w) => w.priceShop > 0 && w.isAvailable);
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/boutique#itemlist`,
    name: SHOP_ENABLED ? "Vins Fins — Boutique en Ligne" : "Vins Fins — Sélection de Vins",
    numberOfItems: shopWines.length,
    itemListElement: shopWines.slice(0, 100).map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      // While the shop is off, /boutique/[id] canonicalises to /vins/[id];
      // reference the canonical wine URL so the ItemList stays consistent.
      url: SHOP_ENABLED ? `${SITE_URL}/boutique/${w.id}` : `${SITE_URL}/vins/${w.id}`,
      name: w.name,
    })),
  };

  return (
    <>
      <Script
        id="json-ld-shop"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd).replace(/</g, "\\u003c") }}
      />
      <Script
        id="json-ld-boutique-itemlist"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c") }}
      />
      <Breadcrumbs
        items={[
          { name: breadcrumbNames.home[locale], url: localeUrl("/", locale) },
          { name: breadcrumbNames.boutique[locale], url: localeUrl("/boutique", locale) },
        ]}
      />
      {children}
    </>
  );
}
