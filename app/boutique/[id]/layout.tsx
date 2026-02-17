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
  return wines.filter((w) => w.priceShop > 0).map((wine) => ({ id: wine.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = getLocale();
  const wine = wines.find((w) => w.id === params.id);
  if (!wine) return { title: "Product not found" };

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
    alternates: {
      canonical: `${SITE_URL}/boutique/${wine.id}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, localeUrl(`/boutique/${wine.id}`, l)])
      ),
    },
    openGraph: {
      title: `${wine.name} — ${wine.priceShop}€ | Vins Fins Boutique`,
      description: desc,
      url: `${SITE_URL}/boutique/${wine.id}`,
      images: [{ url: wine.image, width: 600, height: 800, alt: wine.name }],
    },
  };
}

function buildProductJsonLd(wine: (typeof wines)[number], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: wine.name,
    description: wine.description[locale] || wine.description.fr,
    image: wine.image,
    url: `${SITE_URL}/boutique/${wine.id}`,
    brand: { "@type": "Brand", name: wine.region },
    category: wineCategory[wine.category]?.[locale] || wine.category,
    material: wine.grape,
    countryOfOrigin: { "@type": "Country", name: wine.country },
    offers: {
      "@type": "Offer",
      price: wine.priceShop.toString(),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Vins Fins",
        url: SITE_URL,
      },
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

export default function BoutiqueProductLayout({
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
            id={`json-ld-product-${params.id}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildProductJsonLd(wine, locale)),
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
