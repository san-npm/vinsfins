import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import { wines as staticWines, type Wine } from "@/data/wines";
import { loadData } from "@/lib/storage";
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

type Props = { params: Promise<{ id: string }> };

// `loadData` hits KV first and falls back to the static bundle when KV is
// empty or unreachable. We need that here (not just `staticWines.find`) so
// that wines added in KV after the build are recognised on dynamic SSR
// paths instead of returning a hard 404. Apply the same shippable filter as
// `generateStaticParams` and the sitemap so a delisted product stops
// returning an indexable page on dynamic SSR (existing prerendered pages
// stay until next deploy).
function isShippable(w: Wine): boolean {
  return w.isAvailable && w.priceShop > 0;
}

async function findWine(id: string): Promise<Wine | null> {
  try {
    const all = (await loadData("wines", staticWines)) as Wine[];
    const match = all.find((w) => w.id === id);
    return match && isShippable(match) ? match : null;
  } catch {
    const match = staticWines.find((w) => w.id === id);
    return match && isShippable(match) ? match : null;
  }
}

export async function generateStaticParams() {
  return staticWines.filter(isShippable).map((wine) => ({ id: wine.id }));
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

  return {
    title: `${buyLabel[locale]} ${wine.name} — ${wine.priceShop}€`,
    description: `${desc} ${wine.grape}, ${wine.region}. ${wine.priceShop}€ — livraison Luxembourg.`,
    alternates: alternateUrls(`/boutique/${wine.id}`, locale),
    openGraph: {
      title: `${wine.name} — ${wine.priceShop}€ | Vins Fins Boutique`,
      description: desc,
      url: `${SITE_URL}/boutique/${wine.id}`,
      images: [{ url: wine.image, width: 600, height: 800, alt: wine.name }],
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

  return (
    <>
      {wine && (
        <>
          <Script
            id={`json-ld-product-${id}`}
            type="application/ld+json"
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: jsonLdToScript(
                buildWineProduct({
                  wine,
                  locale,
                  url: `${SITE_URL}/boutique/${wine.id}`,
                  variant: "shop",
                }),
              ),
            }}
          />
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
