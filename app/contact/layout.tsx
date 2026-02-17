import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  getLocale,
  pageMeta,
  SITE_URL,
  localeUrl,
  locales,
  breadcrumbNames,
} from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const meta = pageMeta.contact[locale];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${SITE_URL}/contact`,
      languages: Object.fromEntries(locales.map((l) => [l, localeUrl("/contact", l)])),
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${SITE_URL}/contact`,
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact — Vins Fins",
  url: `${SITE_URL}/contact`,
  mainEntity: {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#restaurant`,
    name: "Vins Fins",
    address: {
      "@type": "PostalAddress",
      streetAddress: "18 Rue Münster",
      addressLocality: "Luxembourg",
      postalCode: "L-2160",
      addressCountry: "LU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 49.60563,
      longitude: 6.13015,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "18:00",
        closes: "00:00",
      },
    ],
    telephone: "+352-XX-XX-XX",
    email: "contact@vinsfins.lu",
    hasMap: "https://maps.google.com/?q=18+Rue+Münster,+Luxembourg",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();

  return (
    <>
      <Script
        id="json-ld-contact"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { name: breadcrumbNames.home[locale], url: localeUrl("/", locale) },
          { name: breadcrumbNames.contact[locale], url: localeUrl("/contact", locale) },
        ]}
      />
      {children}
    </>
  );
}
