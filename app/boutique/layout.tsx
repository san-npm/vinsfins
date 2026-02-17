import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boutique — Achetez nos Vins en Ligne",
  description:
    "Commandez vos vins naturels préférés en ligne. Sélection de domaines bio et biodynamiques. Livraison au Luxembourg.",
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

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
