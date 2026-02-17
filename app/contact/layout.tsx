import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Accès — 18 Rue Münster, Grund",
  description:
    "Retrouvez Vins Fins au 18 Rue Münster, L-2160 Luxembourg-Grund. Ouvert mardi–samedi de 18h à minuit. Réservation en ligne. Plan d'accès et coordonnées.",
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

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
