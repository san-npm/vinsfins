/**
 * Collection-hub definitions. Three routes (`/vins/luxembourg`,
 * `/vins/naturel`, `/vins/bio`) target informational queries surfaced by
 * GSC that the full `/vins` page was not converting (e.g. "vin luxembourg"
 * — 217 combined impressions, 0 clicks).
 *
 * Server-rendered for SEO; static routes take precedence over the sibling
 * `/vins/[id]` dynamic route because no wine id collides with these slugs.
 */
import { wines, type Wine } from "@/data/wines";
import type { Locale } from "@/lib/i18n";

export type HubSlug = "luxembourg" | "naturel" | "bio";

type LocaleText = Record<Locale, string>;

export interface HubConfig {
  slug: HubSlug;
  filter: (w: Wine) => boolean;
  h1: LocaleText;
  eyebrow: LocaleText;
  intro: LocaleText;
  metaTitle: LocaleText;
  metaDescription: LocaleText;
  ogDescription: LocaleText;
  /** Used in the ItemList/Collection JSON-LD. */
  collectionName: LocaleText;
}

const LUX_SECTIONS = new Set(["luxembourg-blanc", "luxembourg-rouge"]);

export const HUBS: Record<HubSlug, HubConfig> = {
  luxembourg: {
    slug: "luxembourg",
    filter: (w) => LUX_SECTIONS.has(w.section),
    h1: {
      fr: "Vins Luxembourgeois",
      en: "Luxembourg Wines",
      de: "Luxemburger Weine",
      lb: "Lëtzebuerger Wäiner",
    },
    eyebrow: {
      fr: "Moselle Luxembourgeoise",
      en: "Luxembourg Moselle",
      de: "Luxemburger Mosel",
      lb: "Lëtzebuerger Musel",
    },
    intro: {
      fr: "Notre sélection de vins de la Moselle luxembourgeoise : Rivaner, Auxerrois, Pinot Gris, Riesling, Pinot Noir et Crémants. Vins de vignerons artisans, à boire sur place ou à emporter.",
      en: "Our selection from the Luxembourg Moselle: Rivaner, Auxerrois, Pinot Gris, Riesling, Pinot Noir and Crémants. Artisan winemakers — drink in, takeaway, or order online.",
      de: "Unsere Auswahl von der Luxemburger Mosel: Rivaner, Auxerrois, Grauburgunder, Riesling, Spätburgunder und Crémants. Handwerkliche Winzer — vor Ort oder online.",
      lb: "Eis Auswiel vun der Lëtzebuerger Musel: Rivaner, Auxerrois, Pinot Gris, Riesling, Pinot Noir a Crémants. Handwierker-Wënzer — op der Plaz oder online.",
    },
    metaTitle: {
      fr: "Vins du Luxembourg — Moselle Luxembourgeoise | Vins Fins",
      en: "Luxembourg Wines — Moselle Wine List | Vins Fins",
      de: "Luxemburger Weine — Mosel-Weinkarte | Vins Fins",
      lb: "Lëtzebuerger Wäiner — Musel-Wäikaart | Vins Fins",
    },
    metaDescription: {
      fr: "Vins de la Moselle luxembourgeoise chez Vins Fins, Grund. Rivaner, Auxerrois, Pinot Gris, Riesling, Crémant. À déguster sur place ou à acheter en ligne.",
      en: "Luxembourg Moselle wines at Vins Fins, Grund. Rivaner, Auxerrois, Pinot Gris, Riesling, Crémant. Dine in or buy online.",
      de: "Luxemburger Moselweine bei Vins Fins, Grund. Rivaner, Auxerrois, Grauburgunder, Riesling, Crémant. Vor Ort oder online.",
      lb: "Lëtzebuerger Muselwäiner bei Vins Fins, Gronn. Rivaner, Auxerrois, Pinot Gris, Riesling, Crémant. Op der Plaz oder online.",
    },
    ogDescription: {
      fr: "La sélection luxembourgeoise de Vins Fins : Rivaner, Auxerrois, Pinot Gris, Riesling, Crémant.",
      en: "Vins Fins' Luxembourg selection: Rivaner, Auxerrois, Pinot Gris, Riesling, Crémant.",
      de: "Luxemburg-Auswahl bei Vins Fins: Rivaner, Auxerrois, Grauburgunder, Riesling, Crémant.",
      lb: "Lëtzebuerg-Auswiel bei Vins Fins: Rivaner, Auxerrois, Pinot Gris, Riesling, Crémant.",
    },
    collectionName: {
      fr: "Vins du Luxembourg",
      en: "Luxembourg Wines",
      de: "Luxemburger Weine",
      lb: "Lëtzebuerger Wäiner",
    },
  },

  naturel: {
    slug: "naturel",
    filter: (w) => w.isNatural,
    h1: {
      fr: "Vins Naturels",
      en: "Natural Wines",
      de: "Naturweine",
      lb: "Naturwäiner",
    },
    eyebrow: {
      fr: "Vinification sans intrants",
      en: "Low-intervention winemaking",
      de: "Naturwein — ohne Zusätze",
      lb: "Naturwäin — ouni Zousätz",
    },
    intro: {
      fr: "Vins de vignerons travaillant sans intrants œnologiques, en fermentation spontanée et avec très peu ou pas de sulfites. Des profils vivants, expressifs, à la signature du terroir.",
      en: "Wines from growers working without oenological additives, spontaneous fermentation, with minimal or no added sulphites. Living, expressive, terroir-driven.",
      de: "Weine von Winzern, die ohne önologische Zusätze arbeiten, spontan vergären und wenig oder keinen Schwefel einsetzen. Lebendig, ausdrucksstark, terroir-geprägt.",
      lb: "Wäiner vu Wënzer, déi ouni Zousätz schaffen, mat spontaner Gärung a wéineg oder kengem Schwiefel. Liewendeg, expressiv a terroir-gepräägt.",
    },
    metaTitle: {
      fr: "Vins Naturels à Luxembourg | Vins Fins, Grund",
      en: "Natural Wines in Luxembourg | Vins Fins, Grund",
      de: "Naturweine in Luxemburg | Vins Fins, Grund",
      lb: "Naturwäiner zu Lëtzebuerg | Vins Fins, Gronn",
    },
    metaDescription: {
      fr: "Sélection de vins naturels chez Vins Fins au Grund : sans sulfites ajoutés, vignerons artisans, fermentation spontanée. À boire sur place ou à la boutique.",
      en: "Natural wine selection at Vins Fins, Grund: no added sulphites, artisan growers, spontaneous fermentation. Dine in or shop online.",
      de: "Naturwein-Auswahl bei Vins Fins, Grund: ohne zugesetzten Schwefel, handwerkliche Winzer, spontane Gärung. Vor Ort oder Online-Shop.",
      lb: "Naturwäin-Auswiel bei Vins Fins, Gronn: ouni Schwiefel, Handwierker-Wënzer, spontan Gärung. Op der Plaz oder am Shop.",
    },
    ogDescription: {
      fr: "Vins naturels sélectionnés par Vins Fins : vignerons artisans, fermentation spontanée, peu ou pas de sulfites.",
      en: "Natural wines curated by Vins Fins: artisan growers, spontaneous fermentation, minimal sulphites.",
      de: "Naturweine von Vins Fins: handwerkliche Winzer, spontane Gärung, minimaler Schwefel.",
      lb: "Naturwäiner vu Vins Fins: Handwierker-Wënzer, spontan Gärung, minimal Schwiefel.",
    },
    collectionName: {
      fr: "Vins Naturels",
      en: "Natural Wines",
      de: "Naturweine",
      lb: "Naturwäiner",
    },
  },

  bio: {
    slug: "bio",
    filter: (w) => w.isOrganic || w.isBiodynamic,
    h1: {
      fr: "Vins Bio & Biodynamie",
      en: "Organic & Biodynamic Wines",
      de: "Bio- & Biodynamische Weine",
      lb: "Bio- a Biodynamesch Wäiner",
    },
    eyebrow: {
      fr: "Agriculture certifiée",
      en: "Certified farming",
      de: "Zertifizierter Anbau",
      lb: "Zertifizéierten Ubau",
    },
    intro: {
      fr: "Vins issus d'agriculture biologique (certifiée AB/ECOCERT) ou biodynamique (Demeter, Biodyvin). Des sols vivants, des raisins en pleine santé, un geste respectueux du vivant.",
      en: "Wines from certified organic (AB/ECOCERT) or biodynamic (Demeter, Biodyvin) farming. Living soils, healthy fruit, and a gesture aligned with the land.",
      de: "Weine aus zertifiziert biologischem (AB/ECOCERT) oder biodynamischem Anbau (Demeter, Biodyvin). Lebendige Böden, gesunde Trauben, Respekt vor dem Terroir.",
      lb: "Wäiner aus zertifizéiertem biologesch (AB/ECOCERT) oder biodynamesch Ubau (Demeter, Biodyvin). Lieweg Buedem, gesond Drauwen, Respekt vum Terroir.",
    },
    metaTitle: {
      fr: "Vins Bio & Biodynamie à Luxembourg | Vins Fins",
      en: "Organic & Biodynamic Wines in Luxembourg | Vins Fins",
      de: "Bio- & Biodynamische Weine in Luxemburg | Vins Fins",
      lb: "Bio- a Biodynamesch Wäiner zu Lëtzebuerg | Vins Fins",
    },
    metaDescription: {
      fr: "Vins bio et biodynamie chez Vins Fins, Grund : certifications AB, ECOCERT, Demeter, Biodyvin. Dégustation sur place, achat en ligne et livraison Luxembourg.",
      en: "Organic & biodynamic wines at Vins Fins, Grund: AB, ECOCERT, Demeter, Biodyvin. Dine in, shop online, Luxembourg delivery.",
      de: "Bio- und biodynamische Weine bei Vins Fins, Grund: AB, ECOCERT, Demeter, Biodyvin. Vor Ort, online und mit Lieferung nach Luxemburg.",
      lb: "Bio- a biodynamesch Wäiner bei Vins Fins, Gronn: AB, ECOCERT, Demeter, Biodyvin. Op der Plaz, online a Liwwerung zu Lëtzebuerg.",
    },
    ogDescription: {
      fr: "Vins issus d'agriculture biologique et biodynamique, certifications AB, ECOCERT, Demeter, Biodyvin.",
      en: "Wines from certified organic and biodynamic farming — AB, ECOCERT, Demeter, Biodyvin.",
      de: "Weine aus zertifiziert biologischem und biodynamischem Anbau — AB, ECOCERT, Demeter, Biodyvin.",
      lb: "Wäiner aus zertifizéiertem biologesch a biodynamesch Ubau — AB, ECOCERT, Demeter, Biodyvin.",
    },
    collectionName: {
      fr: "Vins Bio & Biodynamie",
      en: "Organic & Biodynamic Wines",
      de: "Bio- & Biodynamische Weine",
      lb: "Bio- a Biodynamesch Wäiner",
    },
  },
};

/**
 * Only `luxembourg` is live. `naturel` and `bio` are wired up in HUBS but
 * not exposed here because the underlying `isNatural` / `isOrganic` /
 * `isBiodynamic` flags in data/wines.ts are false for every wine today —
 * shipping those hubs would create empty landing pages (soft-404). Add
 * them back here once the flags are enriched.
 */
export const HUB_SLUGS: HubSlug[] = ["luxembourg"];

export function winesForHub(slug: HubSlug): Wine[] {
  return wines.filter(HUBS[slug].filter);
}
