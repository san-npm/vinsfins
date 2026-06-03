import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import { type Wine } from "@/data/wines";
import { catalogueWines, getPublicWines } from "@/lib/catalogue";
import {
  getLocale,
  getNonce,
  SITE_URL,
  localeUrl,
  breadcrumbNames,
  alternateUrls,
  type Locale,
} from "@/lib/i18n";
import { buildWineProduct, jsonLdToScript } from "@/lib/structured-data";
import { SHOP_ENABLED, WINE_IMAGES_ENABLED } from "@/lib/flags";

type Props = { params: Promise<{ id: string }> };

// The public catalogue resolves through `lib/catalogue` (the single source of
// truth shared with the sitemap, the public API and `/vins/[id]`). Apply the
// shippable filter so a delisted product stops returning an indexable page.
function isShippable(w: Wine): boolean {
  return w.isAvailable && w.priceShop > 0;
}

async function findWine(id: string): Promise<Wine | null> {
  const all = await getPublicWines();
  const match = all.find((w) => w.id === id);
  return match && isShippable(match) ? match : null;
}

export async function generateStaticParams() {
  return catalogueWines().filter(isShippable).map((wine) => ({ id: wine.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocale();
  const { id } = await params;
  const wine = await findWine(id);
  if (!wine) return { title: "Product not found", robots: { index: false, follow: false } };

  const buyLabel: Record<Locale, string> = {
    fr: "Acheter",
    en: "Buy",
    de: "Kaufen",
    lb: "Kafen",
  };
  const desc = wine.description[locale] || wine.description.fr;
  const priceSuffix = SHOP_ENABLED ? ` — ${wine.priceShop}€` : "";

  return {
    title: `${SHOP_ENABLED ? `${buyLabel[locale]} ` : ""}${wine.name}${priceSuffix}`,
    description: `${desc} ${wine.grape}, ${wine.region}.${SHOP_ENABLED ? ` ${wine.priceShop}€ — livraison Luxembourg.` : ""}`,
    // While the shop is off, /boutique/[id] duplicates /vins/[id]; point the
    // canonical at the wine page so search engines consolidate on one URL.
    alternates: SHOP_ENABLED
      ? alternateUrls(`/boutique/${wine.id}`, locale)
      : { canonical: localeUrl(`/vins/${wine.id}`, locale) },
    openGraph: {
      title: `${wine.name}${priceSuffix} | Vins Fins Boutique`,
      description: desc,
      url: `${SITE_URL}/boutique/${wine.id}`,
      images: WINE_IMAGES_ENABLED
        ? [{ url: wine.image, width: 600, height: 800, alt: wine.name }]
        : [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: wine.name }],
    },
  };
}

export default async function BoutiqueProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocale();
  const nonce = await getNonce();
  const { id } = await params;
  const wine = await findWine(id);
  if (!wine) notFound();

  const wineProduct = buildWineProduct({
    wine,
    locale,
    url: `${SITE_URL}/boutique/${wine.id}`,
    variant: "shop",
  });

  return (
    <>
      {wine && (
        <>
          {SHOP_ENABLED && wineProduct && (
          <Script
            id={`json-ld-product-${id}`}
            type="application/ld+json"
            nonce={nonce}
            dangerouslySetInnerHTML={{ __html: jsonLdToScript(wineProduct) }}
          />
          )}
          <Breadcrumbs
            items={[
              { name: breadcrumbNames.home[locale], url: localeUrl("/", locale) },
              {
                name: breadcrumbNames.boutique[locale],
                url: localeUrl("/boutique", locale),
              },
              {
                name: wine.name,
                url: localeUrl(`/boutique/${wine.id}`, locale),
              },
            ]}
          />
        </>
      )}
      {children}
    </>
  );
}
