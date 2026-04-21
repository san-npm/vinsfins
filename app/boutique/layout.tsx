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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const meta = pageMeta.boutique[locale];

  return {
    title: meta.title,
    description: meta.description,
    alternates: alternateUrls("/boutique", locale),
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${SITE_URL}/boutique`,
    },
  };
}

const jsonLd = {
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
};

export default async function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const nonce = await getNonce();
  const shopWines = wines.filter((w) => w.priceShop > 0 && w.isAvailable);
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/boutique#itemlist`,
    name: "Vins Fins — Boutique en Ligne",
    numberOfItems: shopWines.length,
    itemListElement: shopWines.slice(0, 100).map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/boutique/${w.id}`,
      name: w.name,
    })),
  };

  return (
    <>
      <Script
        id="json-ld-shop"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
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
