import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  getLocale,
  getNonce,
  pageMeta,
  SITE_URL,
  localeUrl,
  breadcrumbNames,
  alternateUrls,
  type Locale,
} from "@/lib/i18n";
import { businessProfile } from "@/data/content";
import { faqByLocale } from "@/data/faq";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const meta = pageMeta.contact[locale];

  return {
    title: meta.title,
    description: meta.description,
    alternates: alternateUrls("/contact", locale),
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${SITE_URL}/contact`,
    },
  };
}

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact — Vins Fins",
  url: `${SITE_URL}/contact`,
  mainEntity: {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#restaurant`,
    name: businessProfile.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: businessProfile.streetAddress,
      addressLocality: businessProfile.addressLocality,
      postalCode: businessProfile.postalCode,
      addressCountry: businessProfile.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: businessProfile.geo.latitude,
      longitude: businessProfile.geo.longitude,
    },
    openingHoursSpecification: businessProfile.openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.dayOfWeek,
      opens: slot.opens,
      closes: slot.closes,
    })),
    telephone: businessProfile.telephone,
    email: businessProfile.email,
    hasMap: businessProfile.mapUrl,
  },
};

function buildFaqJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage:
      locale === "fr" ? "fr-FR" : locale === "de" ? "de-DE" : locale === "lb" ? "lb-LU" : "en-US",
    mainEntity: faqByLocale[locale].items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export default async function ContactLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const nonce = await getNonce();
  const faqJsonLd = buildFaqJsonLd(locale);

  return (
    <>
      <Script
        id="json-ld-contact"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd).replace(/</g, "\\u003c") }}
      />
      <Script
        id="json-ld-faq"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
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
