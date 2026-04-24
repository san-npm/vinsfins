import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import { wines } from "@/data/wines";
import {
  getLocale,
  getNonce,
  SITE_URL,
  localeUrl,
  breadcrumbNames,
  wineCategory,
  alternateUrls,
  type Locale,
} from "@/lib/i18n";
import { buildWineProduct, jsonLdToScript } from "@/lib/structured-data";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return wines.map((wine) => ({ id: wine.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocale();
  const { id } = await params;
  const wine = wines.find((w) => w.id === id);
  if (!wine) return { title: "Wine not found" };

  const cat = wineCategory[wine.category]?.[locale] || wine.category;
  const desc = wine.description[locale] || wine.description.fr;

  const byGlass: Record<Locale, string> = {
    fr: "au verre",
    en: "by the glass",
    de: "im Glas",
    lb: "am Glas",
  };
  const byBottle: Record<Locale, string> = {
    fr: "la bouteille",
    en: "bottle",
    de: "Flasche",
    lb: "Fläsch",
  };

  return {
    title: `${wine.name} — ${cat}, ${wine.region}`,
    description: `${desc} ${wine.grape}, ${wine.region}, ${wine.country}. ${wine.priceGlass}€ ${byGlass[locale]}, ${wine.priceBottle}€ ${byBottle[locale]}.`,
    alternates: alternateUrls(`/vins/${wine.id}`, locale),
    openGraph: {
      title: `${wine.name} | Vins Fins Luxembourg`,
      description: desc,
      url: `${SITE_URL}/vins/${wine.id}`,
      images: [{ url: wine.image, width: 600, height: 800, alt: wine.name }],
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
  const wine = wines.find((w) => w.id === id);

  return (
    <>
      {wine && (
        <>
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
