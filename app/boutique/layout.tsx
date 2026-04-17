import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  getLocale,
  pageMeta,
  SITE_URL,
  localeUrl,
  breadcrumbNames,
  alternateUrls,
} from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const meta = pageMeta.boutique[locale];

  return {
    title: meta.title,
    description: meta.description,
    alternates: alternateUrls("/boutique", locale),
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${SITE_URL}/boutique`,
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${SITE_URL}/boutique/#store`,
  name: "Vins Fins — Boutique en Ligne",
  description:
    "Boutique de vins naturels et bio en ligne. Livraison dans tout le Luxembourg.",
  url: `${SITE_URL}/boutique`,
  currenciesAccepted: "EUR",
  paymentAccepted: "Credit Card",
  areaServed: [
    { "@type": "Country", name: "Luxembourg" },
    { "@type": "Country", name: "France" },
    { "@type": "Country", name: "Germany" },
    { "@type": "Country", name: "Belgium" },
  ],
  potentialAction: { "@type": "BuyAction", target: `${SITE_URL}/boutique` },
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();

  return (
    <>
      <Script
        id="json-ld-shop"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Breadcrumbs
        items={[
          { name: breadcrumbNames.home[locale], url: localeUrl("/", locale) },
          { name: breadcrumbNames.boutique[locale], url: localeUrl("/boutique", locale) },
        ]}
      />
      {children}
    </>
  );
}
