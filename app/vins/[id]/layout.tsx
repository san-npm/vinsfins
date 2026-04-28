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
  wineCategory,
  alternateUrls,
  type Locale,
} from "@/lib/i18n";
import { buildWineProduct, jsonLdToScript } from "@/lib/structured-data";

type Props = { params: Promise<{ id: string }> };

// `loadData` hits KV first and falls back to the static bundle when KV is
// empty or unreachable. We need that here (not just `staticWines.find`) so
// that wines added in KV after the build are recognised on dynamic SSR
// paths instead of returning a hard 404 for IDs the page itself can render
// from `useData()`. Prerendered IDs are still frozen at build time — admin
// edits to existing wines propagate through the client fetch, not here.
async function findWine(id: string): Promise<Wine | null> {
  try {
    const all = (await loadData("wines", staticWines)) as Wine[];
    return all.find((w) => w.id === id) ?? null;
  } catch {
    return staticWines.find((w) => w.id === id) ?? null;
  }
}

export async function generateStaticParams() {
  return staticWines.map((wine) => ({ id: wine.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocale();
  const { id } = await params;
  const wine = await findWine(id);
  if (!wine) return { title: "Wine not found", robots: { index: false, follow: false } };

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
  const wine = await findWine(id);
  if (!wine) notFound();

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
