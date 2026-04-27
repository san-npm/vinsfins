import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLdScript from "@/components/JsonLdScript";
import {
  SITE_URL,
  alternateUrls,
  breadcrumbNames,
  getLocale,
  getNonce,
  localeUrl,
} from "@/lib/i18n";
import { buildListProduct } from "@/lib/structured-data";
import { HUBS, type HubSlug, winesForHub } from "@/lib/wine-hubs";

/**
 * Shared layout for /vins/{luxembourg,naturel,bio}. Emits per-locale
 * Metadata and a CollectionPage JSON-LD whose mainEntity is an ItemList of
 * Products — same shape as the main /vins ItemList so every hub can
 * compete for product-carousel rich results.
 */
export async function hubMetadata(slug: HubSlug): Promise<Metadata> {
  const locale = await getLocale();
  const hub = HUBS[slug];
  const path = `/vins/${slug}`;
  return {
    title: hub.metaTitle[locale],
    description: hub.metaDescription[locale],
    alternates: alternateUrls(path, locale),
    openGraph: {
      title: hub.metaTitle[locale],
      description: hub.ogDescription[locale],
      url: `${SITE_URL}${path}`,
    },
  };
}

export default async function HubLayout({
  slug,
  children,
}: {
  slug: HubSlug;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const nonce = await getNonce();
  const hub = HUBS[slug];
  const hubWines = winesForHub(slug);
  const path = `/vins/${slug}`;
  const url = `${SITE_URL}${path}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.collectionName[locale],
    description: hub.metaDescription[locale],
    url,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      name: hub.collectionName[locale],
      numberOfItems: hubWines.length,
      itemListElement: hubWines.slice(0, 20).map((wine, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: buildListProduct({
          wine,
          locale,
          url: `${SITE_URL}/vins/${wine.id}`,
        }),
      })),
    },
  };

  return (
    <>
      <JsonLdScript id={`json-ld-hub-${slug}`} data={jsonLd} nonce={nonce} />
      <Breadcrumbs
        items={[
          { name: breadcrumbNames.home[locale], url: localeUrl("/", locale) },
          { name: breadcrumbNames.vins[locale], url: localeUrl("/vins", locale) },
          { name: hub.h1[locale], url: localeUrl(path, locale) },
        ]}
      />
      {children}
    </>
  );
}
