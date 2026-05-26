import type { Metadata } from "next";
import { getLocale, SITE_URL, alternateUrls } from "@/lib/i18n";

const meta: Record<"fr" | "en" | "de" | "lb", { title: string; description: string }> = {
  fr: {
    title: "Politique de Confidentialité",
    description:
      "Politique de confidentialité Vins Fins : données collectées, finalités, base légale (RGPD), durée de conservation, droits d'accès et d'effacement.",
  },
  en: {
    title: "Privacy Policy",
    description:
      "Vins Fins privacy policy: data collected, purposes, legal basis (GDPR), retention, access and erasure rights.",
  },
  de: {
    title: "Datenschutzerklärung",
    description:
      "Datenschutzerklärung von Vins Fins: erhobene Daten, Zwecke, Rechtsgrundlage (DSGVO), Speicherdauer, Auskunfts- und Löschrechte.",
  },
  lb: {
    title: "Dateschutz-Erklärung",
    description:
      "Dateschutz-Erklärung vu Vins Fins: gesammelt Daten, Zweck, Rechtsgrondlag (RGPD), Späicherdauer, Zougangs- a Läschrechter.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = meta[locale];
  return {
    title: m.title,
    description: m.description,
    alternates: alternateUrls("/legal/confidentialite", locale),
    openGraph: { title: m.title, description: m.description, url: `${SITE_URL}/legal/confidentialite` },
  };
}

export default function ConfidentialiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
