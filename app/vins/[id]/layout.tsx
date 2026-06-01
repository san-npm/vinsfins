import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import { catalogueWines, findPublicWine } from "@/lib/catalogue";
import {
  getLocale,
  getNonce,
  SITE_URL,
  localeUrl,
  breadcrumbNames,
  wineCategory,
  alternateUrls,
} from "@/lib/i18n";
import { buildWineProduct, jsonLdToScript } from "@/lib/structured-data";
import { SHOP_ENABLED, WINE_IMAGES_ENABLED } from "@/lib/flags";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return catalogueWines().map((wine) => ({ id: wine.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocale();
  const { id } = await params;
  const wine = await findPublicWine(id);
  if (!wine) return { title: "Wine not found", robots: { index: false, follow: false } };

  const cat = wineCategory[wine.category]?.[locale] || wine.category;
  const desc = wine.description[locale] || wine.description.fr;
  const priceNote = wine.priceShop > 0 ? ` ${wine.priceShop}€ — livraison Luxembourg.` : "";

  return {
    title: `${wine.name} — ${cat}, ${wine.region}`,
    description: `${desc} ${wine.grape}, ${wine.region}, ${wine.country}.${priceNote}`,
    alternates: alternateUrls(`/vins/${wine.id}`, locale),
    openGraph: {
      title: `${wine.name} | Vins Fins Luxembourg`,
      description: desc,
      url: `${SITE_URL}/vins/${wine.id}`,
      images: WINE_IMAGES_ENABLED
        ? [{ url: wine.image, width: 600, height: 800, alt: wine.name }]
        : [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: wine.name }],
    },
  };
}

export default async function WineLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocale();
  const nonce = await getNonce();
  const { id } = await params;
  const wine = await findPublicWine(id);
  if (!wine) notFound();

  return (
    <>
      {wine && (
        <>
          {SHOP_ENABLED && (
          <Script
            id={`json-ld-wine-${id}`}
            type="application/ld+json"
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: jsonLdToScript(
                buildWineProduct({
                  wine,
                  locale,
                  url: `${SITE_URL}/vins/${wine.id}`,
                  variant: "menu",
                }),
              ),
            }}
          />
          )}
          <Breadcrumbs
            items={[
              { name: breadcrumbNames.home[locale], url: localeUrl("/", locale) },
              { name: breadcrumbNames.vins[locale], url: localeUrl("/vins", locale) },
              {
                name: wine.name,
                url: localeUrl(`/vins/${wine.id}`, locale),
              },
            ]}
          />
        </>
      )}
      {children}
    </>
  );
}
