import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import { wines } from "@/data/wines";
import {
  getLocale,
  pageMeta,
  SITE_URL,
  localeUrl,
  locales,
  breadcrumbNames,
} from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const meta = pageMeta.vins[locale];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${SITE_URL}/vins`,
      languages: Object.fromEntries(locales.map((l) => [l, localeUrl("/vins", l)])),
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${SITE_URL}/vins`,
    },
  };
}

function buildWineListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Carte des Vins — Vins Fins",
    description:
      "Plus de 80 vins naturels et bio sélectionnés auprès de vignerons artisans français et luxembourgeois.",
    url: `${SITE_URL}/vins`,
    numberOfItems: wines.length,
    itemListElement: wines.slice(0, 10).map((wine, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: wine.name,
        description: `${wine.description.fr} ${wine.grape}, ${wine.region}, ${wine.country}.`,
        url: `${SITE_URL}/vins/${wine.id}`,
        offers: {
          "@type": "Offer",
          price: wine.priceBottle.toString(),
          priceCurrency: "EUR",
          availability: wine.isAvailable
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      },
    })),
  };
}

export default function VinsLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const jsonLd = buildWineListJsonLd();

  return (
    <>
      <Script
        id="json-ld-wines"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { name: breadcrumbNames.home[locale], url: localeUrl("/", locale) },
          { name: breadcrumbNames.vins[locale], url: localeUrl("/vins", locale) },
        ]}
      />
      {children}
    </>
  );
}
