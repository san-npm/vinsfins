import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Boutique — Achetez nos Vins en Ligne",
  description:
    "Commandez vos vins naturels préférés en ligne. Sélection de domaines bio et biodynamiques. Livraison gratuite dès 100€ au Luxembourg.",
  alternates: {
    canonical: "https://vinsfins.lu/boutique",
  },
  openGraph: {
    title: "Boutique — Achetez nos Vins en Ligne | Vins Fins Luxembourg",
    description:
      "Commandez vos vins naturels en ligne. Domaines bio et biodynamiques. Livraison Luxembourg.",
    url: "https://vinsfins.lu/boutique",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": "https://vinsfins.lu/boutique/#store",
  name: "Vins Fins — Boutique en Ligne",
  description:
    "Boutique de vins naturels et bio en ligne. Livraison dans tout le Luxembourg. Sélection de vignerons artisans.",
  url: "https://vinsfins.lu/boutique",
  currenciesAccepted: "EUR",
  paymentAccepted: "Credit Card",
  areaServed: {
    "@type": "Country",
    name: "Luxembourg",
  },
  potentialAction: {
    "@type": "BuyAction",
    target: "https://vinsfins.lu/boutique",
  },
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="json-ld-shop"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[
        { name: "Accueil", url: "https://vinsfins.lu" },
        { name: "Boutique", url: "https://vinsfins.lu/boutique" },
      ]} />
      {children}
    </>
  );
}
