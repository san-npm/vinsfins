import type { Metadata } from "next";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import { menuItems } from "@/data/menu";
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
  const meta = pageMeta.carte[locale];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${SITE_URL}/carte`,
      languages: Object.fromEntries(locales.map((l) => [l, localeUrl("/carte", l)])),
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${SITE_URL}/carte`,
    },
  };
}

function buildMenuJsonLd() {
  const sections: Record<string, { name: string; items: typeof menuItems }> = {};
  const sectionNames: Record<string, string> = {
    starters: "Entrées",
    platters: "Planches",
    mains: "Plats",
    desserts: "Desserts",
    specials: "Suggestions",
  };

  for (const item of menuItems) {
    if (!item.isAvailable) continue;
    if (!sections[item.category]) {
      sections[item.category] = { name: sectionNames[item.category] || item.category, items: [] };
    }
    sections[item.category].items.push(item);
  }

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "La Carte — Vins Fins",
    description:
      "Cuisine française de saison au Grund, Luxembourg. Entrées, planches, plats et desserts.",
    url: `${SITE_URL}/carte`,
    inLanguage: "fr",
    hasMenuSection: Object.values(sections).map((section) => ({
      "@type": "MenuSection",
      name: section.name,
      hasMenuItem: section.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name.fr,
        description: item.description.fr,
        offers: {
          "@type": "Offer",
          price: item.price.toString(),
          priceCurrency: "EUR",
        },
      })),
    })),
  };
}

export default function CarteLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const jsonLd = buildMenuJsonLd();

  return (
    <>
      <Script
        id="json-ld-menu"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { name: breadcrumbNames.home[locale], url: localeUrl("/", locale) },
          { name: breadcrumbNames.carte[locale], url: localeUrl("/carte", locale) },
        ]}
      />
      {children}
    </>
  );
}
