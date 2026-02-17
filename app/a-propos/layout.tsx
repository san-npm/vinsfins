import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  getLocale,
  pageMeta,
  SITE_URL,
  localeUrl,
  locales,
  breadcrumbNames,
} from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const meta = pageMeta["a-propos"][locale];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${SITE_URL}/a-propos`,
      languages: Object.fromEntries(locales.map((l) => [l, localeUrl("/a-propos", l)])),
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${SITE_URL}/a-propos`,
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "À Propos de Vins Fins",
  url: `${SITE_URL}/a-propos`,
  mainEntity: {
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: "Vins Fins",
    foundingDate: "2015",
    employee: [
      {
        "@type": "Person",
        name: "Marc",
        jobTitle: "Fondateur & Sommelier",
        description: "Ancien chef sommelier d'un restaurant étoilé Michelin à Paris.",
      },
      {
        "@type": "Person",
        name: "Sophie",
        jobTitle: "Chef Cuisinière",
        description: "Formée à Lyon, spécialisée en cuisine saisonnière et accords mets-vins.",
      },
      {
        "@type": "Person",
        name: "Thomas",
        jobTitle: "Acheteur de Vins & Gérant",
        description: "Expert de la scène vinicole luxembourgeoise et européenne.",
      },
    ],
  },
};

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();

  return (
    <>
      <Script
        id="json-ld-about"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { name: breadcrumbNames.home[locale], url: localeUrl("/", locale) },
          { name: breadcrumbNames["a-propos"][locale], url: localeUrl("/a-propos", locale) },
        ]}
      />
      {children}
    </>
  );
}
