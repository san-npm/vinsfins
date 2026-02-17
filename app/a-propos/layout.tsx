import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À Propos — Notre Histoire",
  description:
    "L'histoire de Vins Fins, bar à vins niché dans le quartier historique du Grund à Luxembourg. Découvrez notre équipe et notre passion pour les vins naturels.",
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

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
