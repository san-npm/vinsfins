import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "La Carte — Cuisine Française de Saison",
  description:
    "Cuisine saisonnière d'inspiration française. Entrées, planches, plats et desserts élaborés avec des produits locaux. Accords mets-vins raffinés au Grund, Luxembourg.",
  alternates: {
    canonical: "https://vinsfins.lu/carte",
  },
  openGraph: {
    title: "La Carte — Cuisine Française de Saison | Vins Fins Luxembourg",
    description:
      "Cuisine saisonnière d'inspiration française. Produits locaux, accords mets-vins raffinés au Grund.",
    url: "https://vinsfins.lu/carte",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Menu",
  name: "La Carte — Vins Fins",
  description:
    "Cuisine française de saison au Grund, Luxembourg. Entrées, planches de charcuterie et fromages, plats et desserts.",
  url: "https://vinsfins.lu/carte",
  inLanguage: "fr",
  hasMenuSection: [
    {
      "@type": "MenuSection",
      name: "Entrées",
      description: "Entrées de saison avec produits locaux luxembourgeois",
    },
    {
      "@type": "MenuSection",
      name: "Planches",
      description: "Planches de charcuterie et fromages artisanaux",
    },
    {
      "@type": "MenuSection",
      name: "Plats",
      description: "Plats d'inspiration française avec accords mets-vins",
    },
    {
      "@type": "MenuSection",
      name: "Desserts",
      description: "Desserts de saison",
    },
  ],
};

export default function CarteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="json-ld-menu"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[
        { name: "Accueil", url: "https://vinsfins.lu" },
        { name: "La Carte", url: "https://vinsfins.lu/carte" },
      ]} />
      {children}
    </>
  );
}
