import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contact & Accès — 18 Rue Münster, Grund",
  description:
    "Retrouvez Vins Fins au 18 Rue Münster, L-2160 Luxembourg-Grund. Ouvert mardi–samedi de 18h à minuit. Réservation en ligne via ZenChef. Plan d'accès et coordonnées.",
  alternates: {
    canonical: "https://vinsfins.lu/contact",
  },
  openGraph: {
    title: "Contact & Accès | Vins Fins — Grund, Luxembourg",
    description:
      "18 Rue Münster, Luxembourg-Grund. Mardi–samedi 18h–00h. Réservation en ligne.",
    url: "https://vinsfins.lu/contact",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact — Vins Fins",
  url: "https://vinsfins.lu/contact",
  mainEntity: {
    "@type": "LocalBusiness",
    "@id": "https://vinsfins.lu/#restaurant",
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
  return (
    <>
      <Script
        id="json-ld-contact"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[
        { name: "Accueil", url: "https://vinsfins.lu" },
        { name: "Contact", url: "https://vinsfins.lu/contact" },
      ]} />
      {children}
    </>
  );
}
