import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import { wines } from "@/data/wines";
import {
  getLocale,
  getNonce,
  pageMeta,
  SITE_URL,
  localeUrl,
  breadcrumbNames,
  alternateUrls,
  type Locale,
} from "@/lib/i18n";
import { buildListProduct, jsonLdToScript } from "@/lib/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const meta = pageMeta.vins[locale];

  return {
    title: meta.title,
    description: meta.description,
    alternates: alternateUrls("/vins", locale),
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${SITE_URL}/vins`,
    },
  };
}

function buildWineListJsonLd(locale: Locale) {
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
      item: buildListProduct({
        wine,
        locale,
        url: `${SITE_URL}/vins/${wine.id}`,
      }),
    })),
  };
}

export default async function VinsLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const nonce = await getNonce();
  const jsonLd = buildWineListJsonLd(locale);

  return (
    <>
      <Script
        id="json-ld-wines"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: jsonLdToScript(jsonLd) }}
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
