import { headers } from "next/headers";

export type Locale = "fr" | "en" | "de" | "lb";

export const locales: Locale[] = ["fr", "en", "de", "lb"];
export const defaultLocale: Locale = "fr";
export const SITE_URL = "https://vinsfins.lu";

export function getLocale(): Locale {
  const locale = headers().get("x-locale");
  if (locale && locales.includes(locale as Locale)) return locale as Locale;
  return defaultLocale;
}

export function localePath(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  return `/${locale}${path}`;
}

export function localeUrl(path: string, locale: Locale): string {
  return `${SITE_URL}${localePath(path, locale)}`;
}

export function alternateUrls(path: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = localeUrl(path, l);
  }
  return { canonical: localeUrl(path, "fr"), languages };
}

/* ──────────────────────────────
   Page metadata translations
   ────────────────────────────── */

type PageMeta = { title: string; description: string; ogTitle: string; ogDescription: string };

export const pageMeta: Record<string, Record<Locale, PageMeta>> = {
  home: {
    fr: {
      title: "Vins Fins — Bar à Vins & Restaurant | Grund, Luxembourg",
      description:
        "Vins d'exception et cuisine raffinée au cœur du Grund. Carte des vins naturels et bio, cuisine française de saison. Réservez votre table.",
      ogTitle: "Vins Fins — Bar à Vins & Restaurant | Grund, Luxembourg",
      ogDescription:
        "Vins d'exception & cuisine raffinée au Grund, Luxembourg. Plus de 80 vins naturels, cuisine française de saison.",
    },
    en: {
      title: "Vins Fins — Wine Bar & Restaurant | Grund, Luxembourg",
      description:
        "Exceptional wines and refined cuisine in the heart of Grund. Natural and organic wine list, seasonal French cuisine. Book your table.",
      ogTitle: "Vins Fins — Wine Bar & Restaurant | Grund, Luxembourg",
      ogDescription:
        "Exceptional wines & refined cuisine in Grund, Luxembourg. Over 80 natural wines, seasonal French cuisine.",
    },
    de: {
      title: "Vins Fins — Weinbar & Restaurant | Grund, Luxemburg",
      description:
        "Außergewöhnliche Weine und raffinierte Küche im Herzen des Grund. Naturweine und Bio-Weine, saisonale französische Küche. Reservieren Sie Ihren Tisch.",
      ogTitle: "Vins Fins — Weinbar & Restaurant | Grund, Luxemburg",
      ogDescription:
        "Außergewöhnliche Weine & raffinierte Küche im Grund, Luxemburg. Über 80 Naturweine, saisonale französische Küche.",
    },
    lb: {
      title: "Vins Fins — Wäibistro & Restaurant | Gronn, Lëtzebuerg",
      description:
        "Aussergewéinlech Wäiner an raffinéiert Kichen am Häerz vum Gronn. Naturwäiner a Bio-Wäiner, saisonal franséisch Kichen. Reservéiert Ären Dësch.",
      ogTitle: "Vins Fins — Wäibistro & Restaurant | Gronn, Lëtzebuerg",
      ogDescription:
        "Aussergewéinlech Wäiner & raffinéiert Kichen am Gronn, Lëtzebuerg. Iwwer 80 Naturwäiner, saisonal franséisch Kichen.",
    },
  },
  vins: {
    fr: {
      title: "Carte des Vins — Vins Naturels & Bio",
      description:
        "Plus de 80 vins naturels et bio sélectionnés auprès de vignerons artisans. Loire, Bourgogne, Beaujolais, Moselle luxembourgeoise. Vins au verre et en bouteille.",
      ogTitle: "Carte des Vins — Vins Naturels & Bio | Vins Fins Luxembourg",
      ogDescription:
        "Plus de 80 vins naturels et bio. Loire, Bourgogne, Moselle luxembourgeoise. Au verre et en bouteille.",
    },
    en: {
      title: "Wine List — Natural & Organic Wines",
      description:
        "Over 80 natural and organic wines from artisan winemakers. Loire, Burgundy, Beaujolais, Luxembourg Moselle. By the glass and bottle.",
      ogTitle: "Wine List — Natural & Organic Wines | Vins Fins Luxembourg",
      ogDescription:
        "Over 80 natural and organic wines. Loire, Burgundy, Luxembourg Moselle. By the glass and bottle.",
    },
    de: {
      title: "Weinkarte — Naturweine & Bio-Weine",
      description:
        "Über 80 Naturweine und Bio-Weine von handwerklichen Winzern. Loire, Burgund, Beaujolais, Luxemburger Mosel. Im Glas und als Flasche.",
      ogTitle: "Weinkarte — Naturweine & Bio-Weine | Vins Fins Luxemburg",
      ogDescription:
        "Über 80 Naturweine und Bio-Weine. Loire, Burgund, Luxemburger Mosel. Im Glas und als Flasche.",
    },
    lb: {
      title: "Wäikaart — Naturwäiner & Bio-Wäiner",
      description:
        "Iwwer 80 Naturwäiner a Bio-Wäiner vu Handwierker-Wënzer. Loire, Burgund, Beaujolais, Lëtzebuerger Musel. Am Glas an als Fläsch.",
      ogTitle: "Wäikaart — Naturwäiner & Bio-Wäiner | Vins Fins Lëtzebuerg",
      ogDescription:
        "Iwwer 80 Naturwäiner a Bio-Wäiner. Loire, Burgund, Lëtzebuerger Musel. Am Glas an als Fläsch.",
    },
  },
  carte: {
    fr: {
      title: "La Carte — Cuisine Française de Saison",
      description:
        "Cuisine saisonnière d'inspiration française. Entrées, planches, plats et desserts élaborés avec des produits locaux. Accords mets-vins raffinés au Grund, Luxembourg.",
      ogTitle: "La Carte — Cuisine Française de Saison | Vins Fins Luxembourg",
      ogDescription:
        "Cuisine saisonnière d'inspiration française. Produits locaux, accords mets-vins raffinés au Grund.",
    },
    en: {
      title: "The Menu — Seasonal French Cuisine",
      description:
        "French-inspired seasonal cuisine. Starters, boards, mains and desserts crafted with local produce. Refined wine pairings in Grund, Luxembourg.",
      ogTitle: "The Menu — Seasonal French Cuisine | Vins Fins Luxembourg",
      ogDescription:
        "French-inspired seasonal cuisine. Local produce, refined wine pairings in Grund.",
    },
    de: {
      title: "Die Speisekarte — Saisonale Französische Küche",
      description:
        "Französisch inspirierte saisonale Küche. Vorspeisen, Platten, Hauptgerichte und Desserts mit lokalen Produkten. Raffinierte Wein-Paarungen im Grund, Luxemburg.",
      ogTitle:
        "Die Speisekarte — Saisonale Französische Küche | Vins Fins Luxemburg",
      ogDescription:
        "Französisch inspirierte saisonale Küche. Lokale Produkte, Wein-Paarungen im Grund.",
    },
    lb: {
      title: "D'Kaart — Saisonal Franséisch Kichen",
      description:
        "Franséisch inspiréiert saisonal Kichen. Virspäisen, Platen, Haaptgeriichter an Desserten mat lokale Produkter. Wäin-Pairings am Gronn, Lëtzebuerg.",
      ogTitle: "D'Kaart — Saisonal Franséisch Kichen | Vins Fins Lëtzebuerg",
      ogDescription:
        "Franséisch inspiréiert saisonal Kichen. Lokal Produkter, Wäin-Pairings am Gronn.",
    },
  },
  boutique: {
    fr: {
      title: "Boutique — Achetez nos Vins en Ligne",
      description:
        "Commandez vos vins naturels préférés en ligne. Sélection de domaines bio et biodynamiques. Livraison gratuite dès 100€ au Luxembourg.",
      ogTitle: "Boutique — Achetez nos Vins en Ligne | Vins Fins Luxembourg",
      ogDescription:
        "Commandez vos vins naturels en ligne. Domaines bio et biodynamiques. Livraison Luxembourg.",
    },
    en: {
      title: "Shop — Buy Our Wines Online",
      description:
        "Order your favourite natural wines online. Selection of organic and biodynamic estates. Free delivery from €100 in Luxembourg.",
      ogTitle: "Shop — Buy Our Wines Online | Vins Fins Luxembourg",
      ogDescription:
        "Order natural wines online. Organic and biodynamic estates. Luxembourg delivery.",
    },
    de: {
      title: "Shop — Unsere Weine Online Kaufen",
      description:
        "Bestellen Sie Ihre Lieblings-Naturweine online. Auswahl an Bio- und biodynamischen Weingütern. Kostenlose Lieferung ab 100€ in Luxemburg.",
      ogTitle: "Shop — Unsere Weine Online Kaufen | Vins Fins Luxemburg",
      ogDescription:
        "Naturweine online bestellen. Bio- und biodynamische Weingüter. Lieferung Luxemburg.",
    },
    lb: {
      title: "Buttek — Eis Wäiner Online Kafen",
      description:
        "Bestellt Är Liibléngs-Naturwäiner online. Auswiel u Bio- a biodynamesche Wënzereien. Gratis Liwwerung ab 100€ zu Lëtzebuerg.",
      ogTitle: "Buttek — Eis Wäiner Online Kafen | Vins Fins Lëtzebuerg",
      ogDescription:
        "Naturwäiner online bestellen. Bio- a biodynamesch Wënzereien. Liwwerung Lëtzebuerg.",
    },
  },
  "a-propos": {
    fr: {
      title: "À Propos — Notre Histoire",
      description:
        "L'histoire de Vins Fins, bar à vins niché dans le quartier historique du Grund à Luxembourg. Découvrez notre équipe passionnée : Marc (sommelier), Sophie (chef) et Thomas (acheteur de vins).",
      ogTitle: "À Propos — Notre Histoire | Vins Fins Luxembourg",
      ogDescription:
        "L'histoire de Vins Fins et notre passion pour les vins naturels au Grund, Luxembourg.",
    },
    en: {
      title: "About — Our Story",
      description:
        "The story of Vins Fins, a wine bar nestled in Luxembourg's historic Grund quarter. Meet our passionate team: Marc (sommelier), Sophie (chef) and Thomas (wine buyer).",
      ogTitle: "About — Our Story | Vins Fins Luxembourg",
      ogDescription:
        "The story of Vins Fins and our passion for natural wines in Grund, Luxembourg.",
    },
    de: {
      title: "Über Uns — Unsere Geschichte",
      description:
        "Die Geschichte von Vins Fins, einer Weinbar im historischen Grund-Viertel in Luxemburg. Lernen Sie unser Team kennen: Marc (Sommelier), Sophie (Köchin) und Thomas (Weineinkäufer).",
      ogTitle: "Über Uns — Unsere Geschichte | Vins Fins Luxemburg",
      ogDescription:
        "Die Geschichte von Vins Fins und unsere Leidenschaft für Naturweine im Grund, Luxemburg.",
    },
    lb: {
      title: "Iwwer Eis — Eis Geschicht",
      description:
        "D'Geschicht vu Vins Fins, enger Wäibistro am historeschen Gronn-Quartier zu Lëtzebuerg. Léiert eist Team kennen: Marc (Sommelier), Sophie (Kächin) an Thomas (Wäinakefer).",
      ogTitle: "Iwwer Eis — Eis Geschicht | Vins Fins Lëtzebuerg",
      ogDescription:
        "D'Geschicht vu Vins Fins an eis Passioun fir Naturwäiner am Gronn, Lëtzebuerg.",
    },
  },
  contact: {
    fr: {
      title: "Contact & Accès — 18 Rue Münster, Grund",
      description:
        "Retrouvez Vins Fins au 18 Rue Münster, L-2160 Luxembourg-Grund. Ouvert mardi–samedi de 18h à minuit. Réservation en ligne via ZenChef.",
      ogTitle: "Contact & Accès | Vins Fins — Grund, Luxembourg",
      ogDescription:
        "18 Rue Münster, Luxembourg-Grund. Mardi–samedi 18h–00h. Réservation en ligne.",
    },
    en: {
      title: "Contact & Directions — 18 Rue Münster, Grund",
      description:
        "Find Vins Fins at 18 Rue Münster, L-2160 Luxembourg-Grund. Open Tuesday–Saturday 6pm to midnight. Online booking via ZenChef.",
      ogTitle: "Contact & Directions | Vins Fins — Grund, Luxembourg",
      ogDescription:
        "18 Rue Münster, Luxembourg-Grund. Tuesday–Saturday 6pm–midnight. Online booking.",
    },
    de: {
      title: "Kontakt & Anfahrt — 18 Rue Münster, Grund",
      description:
        "Finden Sie Vins Fins in der 18 Rue Münster, L-2160 Luxemburg-Grund. Geöffnet Dienstag–Samstag 18–24 Uhr. Online-Reservierung via ZenChef.",
      ogTitle: "Kontakt & Anfahrt | Vins Fins — Grund, Luxemburg",
      ogDescription:
        "18 Rue Münster, Luxemburg-Grund. Dienstag–Samstag 18–24 Uhr. Online-Reservierung.",
    },
    lb: {
      title: "Kontakt & Ufahrt — 18 Rue Münster, Gronn",
      description:
        "Fannt Vins Fins op der 18 Rue Münster, L-2160 Lëtzebuerg-Gronn. Op Dënschdeg–Samschdeg vun 18 bis 24 Auer. Online-Reservéierung via ZenChef.",
      ogTitle: "Kontakt & Ufahrt | Vins Fins — Gronn, Lëtzebuerg",
      ogDescription:
        "18 Rue Münster, Lëtzebuerg-Gronn. Dënschdeg–Samschdeg 18–24 Auer. Online-Reservéierung.",
    },
  },
};

/* Breadcrumb name translations */
export const breadcrumbNames: Record<string, Record<Locale, string>> = {
  home: { fr: "Accueil", en: "Home", de: "Startseite", lb: "Heem" },
  vins: { fr: "Carte des Vins", en: "Wine List", de: "Weinkarte", lb: "Wäikaart" },
  carte: { fr: "La Carte", en: "Menu", de: "Speisekarte", lb: "D'Kaart" },
  boutique: { fr: "Boutique", en: "Shop", de: "Shop", lb: "Buttek" },
  "a-propos": { fr: "À Propos", en: "About", de: "Über Uns", lb: "Iwwer Eis" },
  contact: { fr: "Contact", en: "Contact", de: "Kontakt", lb: "Kontakt" },
};

/* Wine category translations (for metadata) */
export const wineCategory: Record<string, Record<Locale, string>> = {
  red: { fr: "Rouge", en: "Red", de: "Rot", lb: "Rout" },
  white: { fr: "Blanc", en: "White", de: "Weiß", lb: "Wäiss" },
  rosé: { fr: "Rosé", en: "Rosé", de: "Rosé", lb: "Rosé" },
  orange: { fr: "Orange", en: "Orange", de: "Orange", lb: "Orange" },
  sparkling: { fr: "Pétillant", en: "Sparkling", de: "Schaumwein", lb: "Schaumwäin" },
};
