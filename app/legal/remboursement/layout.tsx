import type { Metadata } from "next";
import { getLocale, SITE_URL, alternateUrls } from "@/lib/i18n";

const meta: Record<"fr" | "en" | "de" | "lb", { title: string; description: string }> = {
  fr: {
    title: "Politique de Remboursement & Retours",
    description:
      "Politique de remboursement Vins Fins : droit de rétractation 14 jours, conditions de retour, frais de port, remboursement intégral via le moyen de paiement initial.",
  },
  en: {
    title: "Refund & Return Policy",
    description:
      "Vins Fins refund policy: 14-day right of withdrawal, return conditions, shipping fees, full refund via original payment method.",
  },
  de: {
    title: "Rückerstattungs- und Rücksendepolitik",
    description:
      "Rückerstattungspolitik von Vins Fins: 14 Tage Widerrufsrecht, Rücksendebedingungen, Versandkosten, vollständige Rückerstattung über die ursprüngliche Zahlungsmethode.",
  },
  lb: {
    title: "Réckerstattungs- a Réckschick-Politik",
    description:
      "Réckerstattungs-Politik vu Vins Fins: 14 Deeg Réckruff-Recht, Bedingunge fir Réckschick, Versandkäschten, voll Réckerstattung iwwer déi original Bezuelungsmethod.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = meta[locale];
  return {
    title: m.title,
    description: m.description,
    alternates: alternateUrls("/legal/remboursement", locale),
    openGraph: { title: m.title, description: m.description, url: `${SITE_URL}/legal/remboursement` },
  };
}

export default function RemboursementLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
