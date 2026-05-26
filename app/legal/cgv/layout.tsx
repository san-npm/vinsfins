import type { Metadata } from "next";
import { getLocale, SITE_URL, alternateUrls } from "@/lib/i18n";

const meta: Record<"fr" | "en" | "de" | "lb", { title: string; description: string }> = {
  fr: {
    title: "Conditions Générales de Vente",
    description:
      "Conditions générales de vente de la boutique en ligne Vins Fins : commande, paiement, livraison, droit de rétractation, garantie légale.",
  },
  en: {
    title: "Terms & Conditions of Sale",
    description:
      "Terms and conditions for the Vins Fins online shop: ordering, payment, shipping, right of withdrawal, legal warranty.",
  },
  de: {
    title: "Allgemeine Geschäftsbedingungen",
    description:
      "AGB des Online-Shops Vins Fins: Bestellung, Zahlung, Lieferung, Widerrufsrecht, gesetzliche Gewährleistung.",
  },
  lb: {
    title: "Allgemeng Verkafskonditiounen",
    description:
      "Allgemeng Verkafskonditiounen vum Online-Shop Vins Fins: Bestellung, Bezuelung, Liwwerung, Réckruff-Recht, gesetzlech Garantie.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = meta[locale];
  return {
    title: m.title,
    description: m.description,
    alternates: alternateUrls("/legal/cgv", locale),
    openGraph: { title: m.title, description: m.description, url: `${SITE_URL}/legal/cgv` },
  };
}

export default function CgvLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
