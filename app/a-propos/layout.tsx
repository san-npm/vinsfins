import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "À Propos — Notre Histoire",
  description:
    "L'histoire de Vins Fins, bar à vins niché dans le quartier historique du Grund à Luxembourg. Découvrez notre équipe passionnée : Marc (sommelier), Sophie (chef) et Thomas (acheteur de vins).",
  alternates: {
    canonical: "https://vinsfins.lu/a-propos",
  },
  openGraph: {
    title: "À Propos — Notre Histoire | Vins Fins Luxembourg",
    description:
      "L'histoire de Vins Fins et notre passion pour les vins naturels au Grund, Luxembourg.",
    url: "https://vinsfins.lu/a-propos",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "À Propos de Vins Fins",
  url: "https://vinsfins.lu/a-propos",
  mainEntity: {
    "@type": "Restaurant",
    "@id": "https://vinsfins.lu/#restaurant",
    name: "Vins Fins",
    foundingDate: "2015",
    employee: [
      {
        "@type": "Person",
        name: "Marc",
        jobTitle: "Fondateur & Sommelier",
        description:
          "Ancien chef sommelier d'un restaurant étoilé Michelin à Paris.",
      },
      {
        "@type": "Person",
        name: "Sophie",
        jobTitle: "Chef Cuisinière",
        description:
          "Formée à Lyon, spécialisée en cuisine saisonnière et accords mets-vins.",
      },
      {
        "@type": "Person",
        name: "Thomas",
        jobTitle: "Acheteur de Vins & Gérant",
        description:
          "Expert de la scène vinicole luxembourgeoise et européenne.",
      },
    ],
  },
};

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="json-ld-about"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[
        { name: "Accueil", url: "https://vinsfins.lu" },
        { name: "À Propos", url: "https://vinsfins.lu/a-propos" },
      ]} />
      {children}
    </>
  );
}
