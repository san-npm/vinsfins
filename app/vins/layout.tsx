import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Carte des Vins — Vins Naturels & Bio",
  description:
    "Plus de 80 vins naturels et bio sélectionnés auprès de vignerons artisans. Loire, Bourgogne, Beaujolais, Moselle luxembourgeoise. Vins au verre et en bouteille.",
  alternates: {
    canonical: "https://vinsfins.lu/vins",
  },
  openGraph: {
    title: "Carte des Vins — Vins Naturels & Bio | Vins Fins Luxembourg",
    description:
      "Plus de 80 vins naturels et bio. Loire, Bourgogne, Moselle luxembourgeoise. Au verre et en bouteille.",
    url: "https://vinsfins.lu/vins",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Carte des Vins — Vins Fins",
  description:
    "Plus de 80 vins naturels et bio sélectionnés auprès de vignerons artisans français et luxembourgeois.",
  url: "https://vinsfins.lu/vins",
  numberOfItems: 80,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Product",
        name: "Domaine Vacheron Sancerre 2022",
        description: "Sauvignon Blanc, Loire Valley, France. Vin bio.",
        offers: { "@type": "Offer", price: "58", priceCurrency: "EUR" },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Product",
        name: "Marcel Lapierre Morgon 2021",
        description: "Gamay, Beaujolais, France. Vin naturel bio.",
        offers: { "@type": "Offer", price: "48", priceCurrency: "EUR" },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Product",
        name: "Domaine Krier-Welbes Auxerrois 2022",
        description: "Auxerrois, Moselle, Luxembourg. Vin bio local.",
        offers: { "@type": "Offer", price: "38", priceCurrency: "EUR" },
      },
    },
  ],
};

export default function VinsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="json-ld-wines"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[
        { name: "Accueil", url: "https://vinsfins.lu" },
        { name: "Carte des Vins", url: "https://vinsfins.lu/vins" },
      ]} />
      {children}
    </>
  );
}
