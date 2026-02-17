import type { Metadata } from "next";

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

export default function CarteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
