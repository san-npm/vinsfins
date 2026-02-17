import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import { wines } from "@/data/wines";
import {
  getLocale,
  SITE_URL,
  localeUrl,
  locales,
  breadcrumbNames,
  wineCategory,
  type Locale,
} from "@/lib/i18n";

type Props = { params: { id: string } };

export async function generateStaticParams() {
  return wines.map((wine) => ({ id: wine.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = getLocale();
  const wine = wines.find((w) => w.id === params.id);
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
    alternates: {
      canonical: `${SITE_URL}/vins/${wine.id}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, localeUrl(`/vins/${wine.id}`, l)])
      ),
    },
    openGraph: {
      title: `${wine.name} | Vins Fins Luxembourg`,
      description: desc,
      url: `${SITE_URL}/vins/${wine.id}`,
      images: [{ url: wine.image, width: 600, height: 800, alt: wine.name }],
    },
  };
}

function buildWineProductJsonLd(wine: (typeof wines)[number], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: wine.name,
    description: wine.description[locale] || wine.description.fr,
    image: wine.image,
    url: `${SITE_URL}/vins/${wine.id}`,
    brand: { "@type": "Brand", name: wine.region },
    category: wineCategory[wine.category]?.[locale] || wine.category,
    material: wine.grape,
    countryOfOrigin: { "@type": "Country", name: wine.country },
    offers: [
      {
        "@type": "Offer",
        name: "Au verre",
        price: wine.priceGlass.toString(),
        priceCurrency: "EUR",
        availability: wine.isAvailable
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
      {
        "@type": "Offer",
        name: "Bouteille (restaurant)",
        price: wine.priceBottle.toString(),
        priceCurrency: "EUR",
        availability: wine.isAvailable
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
      ...(wine.priceShop > 0
        ? [
            {
              "@type": "Offer",
              name: "Boutique en ligne",
              price: wine.priceShop.toString(),
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "LU",
                },
                freeShippingThreshold: {
                  "@type": "MonetaryAmount",
                  value: "100",
                  currency: "EUR",
                },
              },
            },
          ]
        : []),
    ],
    additionalProperty: [
      ...(wine.isOrganic
        ? [{ "@type": "PropertyValue", name: "Certification", value: "Bio" }]
        : []),
      ...(wine.isBiodynamic
        ? [{ "@type": "PropertyValue", name: "Certification", value: "Biodynamie" }]
        : []),
    ],
  };
}

export default function WineLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const locale = getLocale();
  const wine = wines.find((w) => w.id === params.id);

  return (
    <>
      {wine && (
        <>
          <Script
            id={`json-ld-wine-${params.id}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildWineProductJsonLd(wine, locale)),
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
