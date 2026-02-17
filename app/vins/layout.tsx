import type { Metadata } from "next";

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

export default function VinsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
