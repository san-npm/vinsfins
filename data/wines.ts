/* ────────────────────────────────────────────────
   Wine list — mirrors the physical wine card
   Sections follow the card order exactly.
   ──────────────────────────────────────────────── */

export const WINE_SECTIONS = [
  'bubbles',
  'luxembourg-blanc',
  'luxembourg-rouge',
  'alsace-blanc',
  'jura-blanc',
  'jura-rouge',
  'languedoc-blanc',
  'languedoc-rouge',
  'bourgogne-blanc',
  'bourgogne-rouge',
] as const;

export type WineSection = (typeof WINE_SECTIONS)[number];

export const sectionLabels: Record<WineSection, Record<string, string>> = {
  'bubbles':           { fr: 'Bulles',            en: 'Bubbles',          de: 'Schaumweine',       lb: 'Bléisercher' },
  'luxembourg-blanc':  { fr: 'Luxembourg Blanc',  en: 'Luxembourg White', de: 'Luxemburg Weiß',    lb: 'Lëtzebuerg Wäiss' },
  'luxembourg-rouge':  { fr: 'Luxembourg Rouge',  en: 'Luxembourg Red',   de: 'Luxemburg Rot',     lb: 'Lëtzebuerg Rout' },
  'alsace-blanc':      { fr: 'Alsace Blanc',       en: 'Alsace White',     de: 'Elsass Weiß',       lb: 'Elsass Wäiss' },
  'jura-blanc':        { fr: 'Jura Blanc',         en: 'Jura White',       de: 'Jura Weiß',         lb: 'Jura Wäiss' },
  'jura-rouge':        { fr: 'Jura Rouge',         en: 'Jura Red',         de: 'Jura Rot',          lb: 'Jura Rout' },
  'languedoc-blanc':   { fr: 'Languedoc Blanc',    en: 'Languedoc White',  de: 'Languedoc Weiß',    lb: 'Languedoc Wäiss' },
  'languedoc-rouge':   { fr: 'Languedoc Rouge',    en: 'Languedoc Red',    de: 'Languedoc Rot',     lb: 'Languedoc Rout' },
  'bourgogne-blanc':   { fr: 'Bourgogne Blanc',    en: 'Burgundy White',   de: 'Burgund Weiß',      lb: 'Burgund Wäiss' },
  'bourgogne-rouge':   { fr: 'Bourgogne Rouge',    en: 'Burgundy Red',     de: 'Burgund Rot',       lb: 'Burgund Rout' },
};

/** Which colour filter each section belongs to */
export const sectionCategory: Record<WineSection, 'sparkling' | 'white' | 'red'> = {
  'bubbles': 'sparkling',
  'luxembourg-blanc': 'white',
  'luxembourg-rouge': 'red',
  'alsace-blanc': 'white',
  'jura-blanc': 'white',
  'jura-rouge': 'red',
  'languedoc-blanc': 'white',
  'languedoc-rouge': 'red',
  'bourgogne-blanc': 'white',
  'bourgogne-rouge': 'red',
};

export interface Wine {
  id: string;
  name: string;
  region: string;
  country: string;
  grape: string;
  category: 'red' | 'white' | 'rosé' | 'orange' | 'sparkling';
  section: WineSection;
  description: Record<'fr' | 'en' | 'de' | 'lb', string>;
  priceGlass: number;
  priceBottle: number;
  priceShop: number;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isOrganic: boolean;
  isBiodynamic: boolean;
  isNatural: boolean;
}

/* Unsplash placeholder images */
const IMG = {
  spark1: 'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=600&h=800&fit=crop',
  spark2: 'https://images.unsplash.com/photo-1598306442928-4d90f32c6866?w=600&h=800&fit=crop',
  white1: 'https://images.unsplash.com/photo-1566754436598-de1cf8f0e33c?w=600&h=800&fit=crop',
  white2: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=600&h=800&fit=crop',
  red1:   'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=800&fit=crop',
  red2:   'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&h=800&fit=crop',
  cider:  'https://images.unsplash.com/photo-1569919659476-f0852f9fcc16?w=600&h=800&fit=crop',
};

export const wines: Wine[] = [

  /* ═══════════════════════════════════════════════
     BUBBLES
     ═══════════════════════════════════════════════ */
  {
    id: 'saint-laurent-cremant-lu',
    name: 'Crémant Saint-Laurent',
    region: 'Moselle', country: 'Luxembourg', grape: 'Saint-Laurent',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Crémant luxembourgeois à base de Saint-Laurent. Fruits rouges et bulles élégantes.',
      en: 'Luxembourg crémant from Saint-Laurent. Red fruits and elegant bubbles.',
      de: 'Luxemburger Crémant aus Saint-Laurent. Rote Früchte und elegante Perlen.',
      lb: 'Lëtzebuerger Crémant aus Saint-Laurent. Rout Friichten an elegant Bläschen.',
    },
    priceGlass: 10, priceBottle: 38, priceShop: 30,
    image: IMG.spark1, isAvailable: true, isFeatured: true,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'sunnen-hoffmann-ure-sun-nen',
    name: 'Sunnen-Hoffmann URE SUN NEN',
    region: 'Moselle', country: 'Luxembourg', grape: 'Assemblage',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Pétillant naturel luxembourgeois. Frais, vivant, bulles fines.',
      en: 'Luxembourg pétillant naturel. Fresh, lively, fine bubbles.',
      de: 'Luxemburgischer Pétillant Naturel. Frisch, lebendig, feine Perlen.',
      lb: 'Lëtzebuerger Pétillant Naturel. Frësch, lieweg, fein Bläschen.',
    },
    priceGlass: 10, priceBottle: 38, priceShop: 30,
    image: IMG.spark2, isAvailable: true, isFeatured: false,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'natur-pur-lu',
    name: 'Natur Pur',
    region: 'Moselle', country: 'Luxembourg', grape: 'Assemblage',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Pétillant naturel luxembourgeois. Pur, spontané, expression du terroir.',
      en: 'Luxembourg pétillant naturel. Pure, spontaneous terroir expression.',
      de: 'Luxemburgischer Pétillant Naturel. Pur, spontan, Terroir-Ausdruck.',
      lb: 'Lëtzebuerger Pétillant Naturel. Pur, spontan, Terroir-Ausdrock.',
    },
    priceGlass: 10, priceBottle: 36, priceShop: 28,
    image: IMG.spark1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'elbling-pinot-blanc-pet-nat-lu',
    name: 'Pét Nat Elbling & Pinot Blanc',
    region: 'Moselle', country: 'Luxembourg', grape: 'Elbling, Pinot Blanc',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Pétillant naturel frais et croquant. Elbling et Pinot Blanc, bulles vives.',
      en: 'Fresh and crisp pétillant naturel. Elbling and Pinot Blanc, lively bubbles.',
      de: 'Frischer Pétillant Naturel. Elbling und Weißburgunder, lebendige Perlen.',
      lb: 'Frëschen Pétillant Naturel. Elbling a Pinot Blanc, lieweg Bläschen.',
    },
    priceGlass: 10, priceBottle: 36, priceShop: 28,
    image: IMG.spark2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'domaine-belliviere',
    name: 'Domaine de Bellivière',
    region: 'Loire', country: 'France', grape: 'Chenin Blanc',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Pétillant naturel de Loire. Pomme, fleur blanche, bulles délicates.',
      en: 'Loire pétillant naturel. Apple, white blossom, delicate bubbles.',
      de: 'Loire Pétillant Naturel. Apfel, weiße Blüte, zarte Perlen.',
      lb: 'Loire Pétillant Naturel. Apel, wäiss Bléi, zart Bläschen.',
    },
    priceGlass: 12, priceBottle: 42, priceShop: 34,
    image: IMG.spark1, isAvailable: true, isFeatured: true,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'les-hautes-terres-limoux',
    name: 'Les Hautes Terres Limoux Méthode Ancestrale 2023',
    region: 'Languedoc', country: 'France', grape: 'Mauzac',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Méthode ancestrale de Limoux. Pomme verte, miel, bulles fines.',
      en: 'Ancestral method from Limoux. Green apple, honey, fine bubbles.',
      de: 'Méthode Ancestrale aus Limoux. Grüner Apfel, Honig, feine Perlen.',
      lb: 'Méthode Ancestrale aus Limoux. Gréngen Apel, Hunneg, fein Bläschen.',
    },
    priceGlass: 11, priceBottle: 40, priceShop: 32,
    image: IMG.spark2, isAvailable: true, isFeatured: false,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'barouillet-semillon',
    name: 'Barouillet Pét Nat Sémillon',
    region: 'Sud-Ouest', country: 'France', grape: 'Sémillon',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Pétillant naturel du Sud-Ouest. Sémillon floral, agrumes et texture.',
      en: 'South-West pétillant naturel. Floral Sémillon, citrus and texture.',
      de: 'Südwest Pétillant Naturel. Blumiger Sémillon, Zitrus und Textur.',
      lb: 'Südwest Pétillant Naturel. Blumesche Sémillon, Zitrus an Textur.',
    },
    priceGlass: 11, priceBottle: 40, priceShop: 32,
    image: IMG.spark1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'lissner-pet-nat-2023',
    name: 'Lissner Pét Nat 2023',
    region: 'Alsace', country: 'France', grape: 'Assemblage',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Pétillant naturel d\'Alsace. Frais, fruité, bulles spontanées.',
      en: 'Alsatian pétillant naturel. Fresh, fruity, spontaneous bubbles.',
      de: 'Elsässer Pétillant Naturel. Frisch, fruchtig, spontane Perlen.',
      lb: 'Elsässer Pétillant Naturel. Frësch, fruchteg, spontan Bläschen.',
    },
    priceGlass: 11, priceBottle: 40, priceShop: 32,
    image: IMG.spark2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'pager-pet-nat-2020',
    name: 'Pager PetNat 2020',
    region: 'Villány', country: 'Hungary', grape: 'Kékfrankos',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Pétillant naturel hongrois. Cerise, épices, bulles rosées.',
      en: 'Hungarian pétillant naturel. Cherry, spices, rosy bubbles.',
      de: 'Ungarischer Pétillant Naturel. Kirsche, Gewürze, rosige Perlen.',
      lb: 'Ungaresch Pétillant Naturel. Kiischt, Gewierzer, roséfaarf Bläschen.',
    },
    priceGlass: 11, priceBottle: 40, priceShop: 32,
    image: IMG.spark1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'vulcain-fendant-2020',
    name: 'Cidrerie du Vulcain Fendant 2020',
    region: 'Valais', country: 'Switzerland', grape: 'Chasselas (Fendant)',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Cidre de Chasselas du Valais. Pomme, minéralité alpine, bulles sèches.',
      en: 'Chasselas cider from Valais. Apple, alpine minerality, dry bubbles.',
      de: 'Chasselas-Cidre aus dem Wallis. Apfel, alpine Mineralität, trockene Perlen.',
      lb: 'Chasselas-Cidre aus dem Wallis. Apel, alpin Mineralitéit, drécken Bläschen.',
    },
    priceGlass: 12, priceBottle: 45, priceShop: 36,
    image: IMG.cider, isAvailable: true, isFeatured: true,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'vulcain-transparente-2018',
    name: 'Cidrerie du Vulcain Transparente 2018 Sec',
    region: 'Valais', country: 'Switzerland', grape: 'Pomme Transparente',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Cidre sec de pomme Transparente. Net, vif, acidité tranchante.',
      en: 'Dry cider from Transparente apple. Clean, lively, sharp acidity.',
      de: 'Trockener Cidre aus Transparente-Apfel. Klar, lebendig, scharfe Säure.',
      lb: 'Drëchene Cidre aus Transparente-Apel. Kloer, lieweg, schaarf Säier.',
    },
    priceGlass: 12, priceBottle: 44, priceShop: 36,
    image: IMG.cider, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'vulcain-trois-pepins-2020',
    name: 'Cidrerie du Vulcain Trois Pépins 2020 Extra-Brut',
    region: 'Valais', country: 'Switzerland', grape: '3 variétés de pommes',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Cidre extra-brut, trois variétés de pommes. Complexe, sec, bulles vives.',
      en: 'Extra-brut cider, three apple varieties. Complex, dry, lively bubbles.',
      de: 'Extra-brut Cidre, drei Apfelsorten. Komplex, trocken, lebendige Perlen.',
      lb: 'Extra-brut Cidre, dräi Apelsoorten. Komplex, drëchen, lieweg Bläschen.',
    },
    priceGlass: 11, priceBottle: 42, priceShop: 34,
    image: IMG.cider, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'vulcain-extra-brut-2022',
    name: 'Cidrerie du Vulcain 2022 Extra-Brut',
    region: 'Valais', country: 'Switzerland', grape: 'Pomme',
    category: 'sparkling', section: 'bubbles',
    description: {
      fr: 'Cidre extra-brut millésimé 2022. Frais, tendu, finale sèche.',
      en: 'Vintage 2022 extra-brut cider. Fresh, taut, dry finish.',
      de: 'Jahrgangs-Cidre 2022 Extra-Brut. Frisch, straff, trockener Abgang.',
      lb: 'Joergangs-Cidre 2022 Extra-Brut. Frësch, straff, drëchenen Ofschloss.',
    },
    priceGlass: 12, priceBottle: 45, priceShop: 36,
    image: IMG.cider, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },

  /* ═══════════════════════════════════════════════
     LUXEMBOURG BLANC
     ═══════════════════════════════════════════════ */
  {
    id: 'auxerrois-pinot-blanc-2022',
    name: 'Auxerrois & Pinot Blanc 2022',
    region: 'Moselle', country: 'Luxembourg', grape: 'Auxerrois, Pinot Blanc',
    category: 'white', section: 'luxembourg-blanc',
    description: {
      fr: 'Assemblage luxembourgeois frais. Fruits blancs, floral, belle acidité.',
      en: 'Fresh Luxembourg blend. White fruits, floral, fine acidity.',
      de: 'Frische Luxemburger Cuvée. Weiße Früchte, blumig, schöne Säure.',
      lb: 'Frësch Lëtzebuerger Cuvée. Wäiss Friichten, blumesch, schéin Säier.',
    },
    priceGlass: 11, priceBottle: 44, priceShop: 35,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'bob-molling-riesling-2021',
    name: 'Bob Molling Riesling 2021',
    region: 'Moselle', country: 'Luxembourg', grape: 'Riesling',
    category: 'white', section: 'luxembourg-blanc',
    description: {
      fr: 'Riesling luxembourgeois minéral et précis. Agrumes, silex, longueur.',
      en: 'Mineral and precise Luxembourg Riesling. Citrus, flint, length.',
      de: 'Mineralischer und präziser Luxemburger Riesling. Zitrus, Feuerstein, Länge.',
      lb: 'Mineralesch a präzis Lëtzebuerger Riesling. Zitrus, Feierstein, Längt.',
    },
    priceGlass: 12, priceBottle: 48, priceShop: 38,
    image: IMG.white2, isAvailable: true, isFeatured: true,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'bob-molling-pinot-gris-2022',
    name: 'Bob Molling Pinot Gris 2022',
    region: 'Moselle', country: 'Luxembourg', grape: 'Pinot Gris',
    category: 'white', section: 'luxembourg-blanc',
    description: {
      fr: 'Pinot Gris riche et texturé. Fruits jaunes, épices douces.',
      en: 'Rich and textured Pinot Gris. Yellow fruits, gentle spices.',
      de: 'Reicher und texturierter Pinot Gris. Gelbe Früchte, sanfte Gewürze.',
      lb: 'Räichen an texturéierte Pinot Gris. Giel Friichten, mëll Gewierzer.',
    },
    priceGlass: 12, priceBottle: 46, priceShop: 37,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'racines-rebelles-roche-liquide',
    name: 'Racines Rebelles Roche Liquide 2021',
    region: 'Moselle', country: 'Luxembourg', grape: 'Elbling',
    category: 'white', section: 'luxembourg-blanc',
    description: {
      fr: 'Elbling naturel de la Moselle. Minéral, salin, roche liquide.',
      en: 'Natural Moselle Elbling. Mineral, saline, liquid rock.',
      de: 'Natürlicher Mosel-Elbling. Mineralisch, salzig, flüssiger Fels.',
      lb: 'Natierlech Musel-Elbling. Mineralesch, salzeg, flëssege Fiels.',
    },
    priceGlass: 15, priceBottle: 60, priceShop: 48,
    image: IMG.white2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'racines-rebelles-echo',
    name: 'Racines Rebelles Echo 2023',
    region: 'Moselle', country: 'Luxembourg', grape: 'Auxerrois',
    category: 'white', section: 'luxembourg-blanc',
    description: {
      fr: 'Auxerrois naturel. Ample, texturé, écho du terroir mosellan.',
      en: 'Natural Auxerrois. Broad, textured, echo of Moselle terroir.',
      de: 'Natürlicher Auxerrois. Breit, texturiert, Echo des Mosel-Terroirs.',
      lb: 'Natierlech Auxerrois. Breet, texturéiert, Echo vum Musel-Terroir.',
    },
    priceGlass: 20, priceBottle: 80, priceShop: 64,
    image: IMG.white1, isAvailable: true, isFeatured: true,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'racines-rebelles-la-source',
    name: 'Racines Rebelles La Source 2022',
    region: 'Moselle', country: 'Luxembourg', grape: 'Pinot Blanc',
    category: 'white', section: 'luxembourg-blanc',
    description: {
      fr: 'Pinot Blanc de parcelle unique. Profond, complexe, source pure.',
      en: 'Single-parcel Pinot Blanc. Deep, complex, pure source.',
      de: 'Einzellagen-Weißburgunder. Tief, komplex, reine Quelle.',
      lb: 'Eenzel-Parzell Pinot Blanc. Déif, komplex, reng Quell.',
    },
    priceGlass: 21, priceBottle: 85, priceShop: 68,
    image: IMG.white2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'racines-rebelles-deux-sources',
    name: 'Racines Rebelles Les Deux Sources 2023',
    region: 'Moselle', country: 'Luxembourg', grape: 'Pinot Blanc, Elbling',
    category: 'white', section: 'luxembourg-blanc',
    description: {
      fr: 'Assemblage Pinot Blanc et Elbling. Deux sources, un terroir.',
      en: 'Pinot Blanc and Elbling blend. Two sources, one terroir.',
      de: 'Weißburgunder und Elbling Cuvée. Zwei Quellen, ein Terroir.',
      lb: 'Pinot Blanc an Elbling Cuvée. Zwou Quellen, ee Terroir.',
    },
    priceGlass: 17, priceBottle: 68, priceShop: 54,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'racines-rebelles-rosenberg',
    name: 'Racines Rebelles Rosenberg 2019',
    region: 'Moselle', country: 'Luxembourg', grape: 'Riesling, Pinot Gris',
    category: 'white', section: 'luxembourg-blanc',
    description: {
      fr: 'Assemblage Riesling et Pinot Gris du lieu-dit Rosenberg. Complexe et élégant.',
      en: 'Riesling and Pinot Gris from the Rosenberg lieu-dit. Complex and elegant.',
      de: 'Riesling und Pinot Gris aus der Lage Rosenberg. Komplex und elegant.',
      lb: 'Riesling a Pinot Gris vum Rosenberg. Komplex an elegant.',
    },
    priceGlass: 19, priceBottle: 75, priceShop: 60,
    image: IMG.white2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'racines-rebelles-synergie-sauvage',
    name: 'Racines Rebelles Synergie Sauvage 2023',
    region: 'Moselle', country: 'Luxembourg', grape: 'Muscaris, Pinot Gris, Auxerrois',
    category: 'white', section: 'luxembourg-blanc',
    description: {
      fr: 'Assemblage sauvage de trois cépages. Aromatique, vivant, synergies naturelles.',
      en: 'Wild blend of three grapes. Aromatic, lively, natural synergies.',
      de: 'Wilde Cuvée aus drei Rebsorten. Aromatisch, lebendig, natürliche Synergien.',
      lb: 'Wëll Cuvée aus dräi Drauwesoorten. Aromatesch, lieweg, natierlech Synergien.',
    },
    priceGlass: 13, priceBottle: 53, priceShop: 42,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'racines-rebelles-sur-la-peau',
    name: 'Racines Rebelles Sur la Peau 2022',
    region: 'Moselle', country: 'Luxembourg', grape: 'Elbling',
    category: 'white', section: 'luxembourg-blanc',
    description: {
      fr: 'Elbling macération pelliculaire. Texture, profondeur, vin de peau.',
      en: 'Skin-contact Elbling. Texture, depth, a wine of skin.',
      de: 'Maischevergorener Elbling. Textur, Tiefe, Maischewein.',
      lb: 'Maischevergore Elbling. Textur, Déift, Maischewäin.',
    },
    priceGlass: 18, priceBottle: 70, priceShop: 56,
    image: IMG.white2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'chateau-pauque-topaze-imperiale',
    name: 'Château Pauqué Topaze Impériale Auxerrois 2014 & Rivaner 2020',
    region: 'Moselle', country: 'Luxembourg', grape: 'Auxerrois, Rivaner',
    category: 'white', section: 'luxembourg-blanc',
    description: {
      fr: 'Assemblage unique de deux millésimes. Complexe, doré, notes de miel.',
      en: 'Unique blend of two vintages. Complex, golden, honey notes.',
      de: 'Einzigartige Cuvée zweier Jahrgänge. Komplex, golden, Honigtöne.',
      lb: 'Eenzegaarteg Cuvée vun zwee Joergäng. Komplex, golden, Hunnegténg.',
    },
    priceGlass: 16, priceBottle: 65, priceShop: 52,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: false,
  },

  /* ═══════════════════════════════════════════════
     LUXEMBOURG ROUGE
     ═══════════════════════════════════════════════ */
  {
    id: 'lunatic-saint-laurent',
    name: 'Lunatic',
    region: 'Moselle', country: 'Luxembourg', grape: 'Saint-Laurent, Pinot Noir, Pinot Gris',
    category: 'red', section: 'luxembourg-rouge',
    description: {
      fr: 'Rouge luxembourgeois naturel. Fruits noirs, épices, structure souple.',
      en: 'Natural Luxembourg red. Dark fruits, spices, supple structure.',
      de: 'Natürlicher Luxemburger Rotwein. Dunkle Früchte, Gewürze, geschmeidige Struktur.',
      lb: 'Natierlech Lëtzebuerger Routwäin. Donkel Friichten, Gewierzer, geschmeideg Struktur.',
    },
    priceGlass: 20, priceBottle: 80, priceShop: 64,
    image: IMG.red1, isAvailable: true, isFeatured: true,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },

  /* ═══════════════════════════════════════════════
     ALSACE BLANC
     ═══════════════════════════════════════════════ */
  {
    id: 'ruhlmann-riesling-2022',
    name: 'Ruhlmann-Dirringer Riesling 2022',
    region: 'Alsace', country: 'France', grape: 'Riesling',
    category: 'white', section: 'alsace-blanc',
    description: {
      fr: 'Riesling alsacien naturel. Agrumes, pierre, tension minérale.',
      en: 'Natural Alsatian Riesling. Citrus, stone, mineral tension.',
      de: 'Natürlicher Elsässer Riesling. Zitrus, Stein, mineralische Spannung.',
      lb: 'Natierlech Elsässer Riesling. Zitrus, Steen, mineralesch Spannung.',
    },
    priceGlass: 10, priceBottle: 38, priceShop: 30,
    image: IMG.white2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'ruhlmann-pinot-auxerrois',
    name: 'Ruhlmann-Dirringer Pinot & Auxerrois 21, 22 & 23',
    region: 'Alsace', country: 'France', grape: 'Pinot Blanc, Auxerrois',
    category: 'white', section: 'alsace-blanc',
    description: {
      fr: 'Assemblage multi-millésimes. Rondeur, fruit blanc, expression libre.',
      en: 'Multi-vintage blend. Roundness, white fruit, free expression.',
      de: 'Multi-Jahrgangs-Cuvée. Rundheit, weißes Obst, freier Ausdruck.',
      lb: 'Multi-Joergangs-Cuvée. Ronnheet, wäiss Uebst, fräien Ausdrock.',
    },
    priceGlass: 10, priceBottle: 38, priceShop: 30,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'ruhlmann-breitstein',
    name: 'Ruhlmann-Dirringer Breitstein Pierres Larges 2021',
    region: 'Alsace', country: 'France', grape: 'Pinot Gris, Pinot Noir',
    category: 'white', section: 'alsace-blanc',
    description: {
      fr: 'Lieu-dit Breitstein. Pierres larges, profondeur et caractère.',
      en: 'Breitstein lieu-dit. Broad stones, depth and character.',
      de: 'Lage Breitstein. Breite Steine, Tiefe und Charakter.',
      lb: 'Lag Breitstein. Breet Steng, Déift a Charakter.',
    },
    priceGlass: 10, priceBottle: 39, priceShop: 31,
    image: IMG.white2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'ruhlmann-riesling-pinot-gris',
    name: 'Ruhlmann-Dirringer Riesling & Pinot Gris 21 & 22',
    region: 'Alsace', country: 'France', grape: 'Riesling, Pinot Gris',
    category: 'white', section: 'alsace-blanc',
    description: {
      fr: 'Assemblage Riesling et Pinot Gris multi-millésimes. Équilibre et complexité.',
      en: 'Multi-vintage Riesling and Pinot Gris blend. Balance and complexity.',
      de: 'Multi-Jahrgangs-Cuvée Riesling und Pinot Gris. Gleichgewicht und Komplexität.',
      lb: 'Multi-Joergangs-Cuvée Riesling a Pinot Gris. Gläichgewiicht a Komplexitéit.',
    },
    priceGlass: 10, priceBottle: 40, priceShop: 32,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'lissner-pinot-blanc-2021',
    name: 'Lissner Pinot Blanc 2021',
    region: 'Alsace', country: 'France', grape: 'Pinot Blanc',
    category: 'white', section: 'alsace-blanc',
    description: {
      fr: 'Pinot Blanc naturel d\'Alsace. Pur, net, fruits blancs.',
      en: 'Natural Alsatian Pinot Blanc. Pure, clean, white fruits.',
      de: 'Natürlicher Elsässer Weißburgunder. Pur, klar, weiße Früchte.',
      lb: 'Natierlech Elsässer Pinot Blanc. Pur, kloer, wäiss Friichten.',
    },
    priceGlass: 10, priceBottle: 39, priceShop: 31,
    image: IMG.white2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'lissner-pinot-gris-2018',
    name: 'Lissner Pinot Gris 2018',
    region: 'Alsace', country: 'France', grape: 'Pinot Gris',
    category: 'white', section: 'alsace-blanc',
    description: {
      fr: 'Pinot Gris évolué et complexe. Miel, épices douces, texture.',
      en: 'Evolved and complex Pinot Gris. Honey, gentle spices, texture.',
      de: 'Gereifter und komplexer Pinot Gris. Honig, sanfte Gewürze, Textur.',
      lb: 'Gereifte a komplexe Pinot Gris. Hunneg, mëll Gewierzer, Textur.',
    },
    priceGlass: 11, priceBottle: 42, priceShop: 34,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'obertal-colline-horn',
    name: 'Obertal Colline de Horn Pinot Blanc 2020',
    region: 'Alsace', country: 'France', grape: 'Pinot Blanc',
    category: 'white', section: 'alsace-blanc',
    description: {
      fr: 'Pinot Blanc de la colline de Horn. Terroir volcanique, minéral.',
      en: 'Pinot Blanc from the Horn hill. Volcanic terroir, mineral.',
      de: 'Weißburgunder vom Horn-Hügel. Vulkanisches Terroir, mineralisch.',
      lb: 'Pinot Blanc vum Horn-Hiwwel. Vulkanesch Terroir, mineralesch.',
    },
    priceGlass: 11, priceBottle: 44, priceShop: 35,
    image: IMG.white2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'obertal-pinot-gris-2022',
    name: 'Obertal Pinot Gris 2022',
    region: 'Alsace', country: 'France', grape: 'Pinot Gris',
    category: 'white', section: 'alsace-blanc',
    description: {
      fr: 'Pinot Gris naturel et expressif. Fruits jaunes, tension.',
      en: 'Natural and expressive Pinot Gris. Yellow fruits, tension.',
      de: 'Natürlicher und ausdrucksvoller Pinot Gris. Gelbe Früchte, Spannung.',
      lb: 'Natierlech an expressiven Pinot Gris. Giel Friichten, Spannung.',
    },
    priceGlass: 11, priceBottle: 42, priceShop: 34,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'lissner-gewurztraminer-2018',
    name: 'Lissner Gewürztraminer 2018',
    region: 'Alsace', country: 'France', grape: 'Gewürztraminer',
    category: 'white', section: 'alsace-blanc',
    description: {
      fr: 'Gewürztraminer naturel. Rose, litchi, épices, sec et élégant.',
      en: 'Natural Gewürztraminer. Rose, lychee, spices, dry and elegant.',
      de: 'Natürlicher Gewürztraminer. Rose, Litschi, Gewürze, trocken und elegant.',
      lb: 'Natierlech Gewürztraminer. Rous, Litschi, Gewierzer, drëchen an elegant.',
    },
    priceGlass: 11, priceBottle: 44, priceShop: 35,
    image: IMG.white2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'lissner-riesling-2022',
    name: 'Lissner Riesling 2022',
    region: 'Alsace', country: 'France', grape: 'Riesling',
    category: 'white', section: 'alsace-blanc',
    description: {
      fr: 'Riesling naturel alsacien. Citron, minéral, vif et tendu.',
      en: 'Natural Alsatian Riesling. Lemon, mineral, lively and taut.',
      de: 'Natürlicher Elsässer Riesling. Zitrone, mineralisch, lebendig und straff.',
      lb: 'Natierlech Elsässer Riesling. Zitroun, mineralesch, lieweg a straff.',
    },
    priceGlass: 10, priceBottle: 40, priceShop: 32,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },

  /* ═══════════════════════════════════════════════
     JURA BLANC
     ═══════════════════════════════════════════════ */
  {
    id: 'pinte-savagnin-2019',
    name: 'Domaine de la Pinte Savagnin 2019',
    region: 'Jura', country: 'France', grape: 'Savagnin',
    category: 'white', section: 'jura-blanc',
    description: {
      fr: 'Savagnin ouillé du Jura bio. Noix, curry, oxydatif maîtrisé.',
      en: 'Organic Jura Savagnin under ouillé. Walnut, curry, controlled oxidation.',
      de: 'Bio Jura Savagnin ouillé. Walnuss, Curry, kontrollierte Oxidation.',
      lb: 'Bio Jura Savagnin ouillé. Noss, Curry, kontrolléiert Oxidatioun.',
    },
    priceGlass: 15, priceBottle: 59, priceShop: 47,
    image: IMG.white2, isAvailable: true, isFeatured: true,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'pinte-savagnin-2019-magnum',
    name: 'Domaine de la Pinte Savagnin 2019 (1,5L)',
    region: 'Jura', country: 'France', grape: 'Savagnin',
    category: 'white', section: 'jura-blanc',
    description: {
      fr: 'Savagnin en magnum. Ampleur et complexité magnifiées par le format.',
      en: 'Savagnin in magnum. Breadth and complexity magnified by format.',
      de: 'Savagnin in der Magnum. Breite und Komplexität durch das Format verstärkt.',
      lb: 'Savagnin an der Magnum. Breet a Komplexitéit duerch d\'Format verstäerkt.',
    },
    priceGlass: 0, priceBottle: 118, priceShop: 0,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'ganevat-savagnin-2008',
    name: 'JF Ganevat Savagnin 2008',
    region: 'Jura', country: 'France', grape: 'Savagnin',
    category: 'white', section: 'jura-blanc',
    description: {
      fr: 'Savagnin d\'exception du maître Ganevat. 2008, complexité absolue.',
      en: 'Exceptional Savagnin from master Ganevat. 2008, absolute complexity.',
      de: 'Außergewöhnlicher Savagnin von Meister Ganevat. 2008, absolute Komplexität.',
      lb: 'Aussergewéinleche Savagnin vum Meeschter Ganevat. 2008, absolut Komplexitéit.',
    },
    priceGlass: 0, priceBottle: 150, priceShop: 0,
    image: IMG.white2, isAvailable: true, isFeatured: true,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'cabaret-suspendue-savagnin',
    name: 'Cabaret des Oiseaux Suspendue Savagnin 2023',
    region: 'Jura', country: 'France', grape: 'Savagnin',
    category: 'white', section: 'jura-blanc',
    description: {
      fr: 'Savagnin suspendu entre ciel et terre. Frais, tendu, aérien.',
      en: 'Savagnin suspended between sky and earth. Fresh, taut, airy.',
      de: 'Savagnin zwischen Himmel und Erde. Frisch, straff, luftig.',
      lb: 'Savagnin tëschent Himmel an Äerd. Frësch, straff, lofteg.',
    },
    priceGlass: 14, priceBottle: 55, priceShop: 44,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'cabaret-attraction-chardonnay',
    name: 'Cabaret des Oiseaux Attraction Chardonnay 2023',
    region: 'Jura', country: 'France', grape: 'Chardonnay',
    category: 'white', section: 'jura-blanc',
    description: {
      fr: 'Chardonnay jurassien. Noisette, beurre frais, minéralité.',
      en: 'Jura Chardonnay. Hazelnut, fresh butter, minerality.',
      de: 'Jura Chardonnay. Haselnuss, frische Butter, Mineralität.',
      lb: 'Jura Chardonnay. Hieselnoss, frësch Botter, Mineralitéit.',
    },
    priceGlass: 14, priceBottle: 55, priceShop: 44,
    image: IMG.white2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'maenad-chardonnay-2022',
    name: 'Maison Maenad Chardonnay 2022',
    region: 'Jura', country: 'France', grape: 'Chardonnay',
    category: 'white', section: 'jura-blanc',
    description: {
      fr: 'Chardonnay jurassien expressif. Fruits blancs, tension vive.',
      en: 'Expressive Jura Chardonnay. White fruits, lively tension.',
      de: 'Ausdrucksvoller Jura Chardonnay. Weiße Früchte, lebendige Spannung.',
      lb: 'Expressiven Jura Chardonnay. Wäiss Friichten, lieweg Spannung.',
    },
    priceGlass: 13, priceBottle: 50, priceShop: 40,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'rousset-martin-vigne-dames',
    name: 'François Rousset-Martin Vigne aux Dames Savagnin',
    region: 'Jura', country: 'France', grape: 'Savagnin',
    category: 'white', section: 'jura-blanc',
    description: {
      fr: 'Savagnin de la Vigne aux Dames. Profond, oxydatif, noblesse.',
      en: 'Savagnin from Vigne aux Dames. Deep, oxidative, nobility.',
      de: 'Savagnin aus der Vigne aux Dames. Tief, oxidativ, Noblesse.',
      lb: 'Savagnin aus der Vigne aux Dames. Déif, oxidativ, Noblesse.',
    },
    priceGlass: 16, priceBottle: 65, priceShop: 52,
    image: IMG.white2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: false,
  },

  /* ═══════════════════════════════════════════════
     JURA ROUGE
     ═══════════════════════════════════════════════ */
  {
    id: 'cabaret-suspendue-trousseau',
    name: 'Cabaret des Oiseaux Suspendue Trousseau 2023',
    region: 'Jura', country: 'France', grape: 'Trousseau',
    category: 'red', section: 'jura-rouge',
    description: {
      fr: 'Trousseau jurassien léger et épicé. Cerise, poivre, fraîcheur.',
      en: 'Light and spiced Jura Trousseau. Cherry, pepper, freshness.',
      de: 'Leichter und gewürziger Jura Trousseau. Kirsche, Pfeffer, Frische.',
      lb: 'Liichten a gewierzte Jura Trousseau. Kiischt, Pfeffer, Frëschheet.',
    },
    priceGlass: 14, priceBottle: 55, priceShop: 44,
    image: IMG.red1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: false,
  },

  /* ═══════════════════════════════════════════════
     LANGUEDOC BLANC
     ═══════════════════════════════════════════════ */
  {
    id: 'barral-terret-viognier-2022',
    name: 'Léon Barral Terret, Viognier & Roussanne 2022',
    region: 'Languedoc', country: 'France', grape: 'Terret, Viognier, Roussanne',
    category: 'white', section: 'languedoc-blanc',
    description: {
      fr: 'Assemblage blanc méditerranéen bio. Garrigue, abricot, ampleur.',
      en: 'Organic Mediterranean white blend. Garrigue, apricot, breadth.',
      de: 'Bio mediterraner Weißwein-Cuvée. Garrigue, Aprikose, Breite.',
      lb: 'Bio mediterrane Wäisswäin-Cuvée. Garrigue, Abrikose, Breet.',
    },
    priceGlass: 16, priceBottle: 65, priceShop: 52,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },

  /* ═══════════════════════════════════════════════
     LANGUEDOC ROUGE
     ═══════════════════════════════════════════════ */
  {
    id: 'grange-des-peres-2021',
    name: 'Domaine de la Grange des Pères 2021',
    region: 'Languedoc', country: 'France', grape: 'Syrah, Mourvèdre, Cabernet, Counoise',
    category: 'red', section: 'languedoc-rouge',
    description: {
      fr: 'Grand vin du Languedoc. Profond, complexe, l\'un des plus grands vins du sud.',
      en: 'Great Languedoc wine. Deep, complex, one of the greatest wines of the south.',
      de: 'Großer Languedoc-Wein. Tief, komplex, einer der größten Weine des Südens.',
      lb: 'Grousse Languedoc-Wäin. Déif, komplex, ee vun de gréisste Wäiner vum Süden.',
    },
    priceGlass: 0, priceBottle: 300, priceShop: 0,
    image: IMG.red2, isAvailable: true, isFeatured: true,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'barral-faugeres-2020',
    name: 'Léon Barral Faugères 2020',
    region: 'Languedoc', country: 'France', grape: 'Carignan, Grenache, Cinsault',
    category: 'red', section: 'languedoc-rouge',
    description: {
      fr: 'Faugères bio. Garrigue, fruits noirs, tannins soyeux, profondeur.',
      en: 'Organic Faugères. Garrigue, dark fruits, silky tannins, depth.',
      de: 'Bio Faugères. Garrigue, dunkle Früchte, seidige Tannine, Tiefe.',
      lb: 'Bio Faugères. Garrigue, donkel Friichten, seideg Tanninen, Déift.',
    },
    priceGlass: 14, priceBottle: 55, priceShop: 44,
    image: IMG.red1, isAvailable: true, isFeatured: false,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },

  /* ═══════════════════════════════════════════════
     BOURGOGNE BLANC
     ═══════════════════════════════════════════════ */
  {
    id: 'vincent-dancer-bourgogne-2021',
    name: 'Vincent Dancer Bourgogne 2021',
    region: 'Bourgogne', country: 'France', grape: 'Chardonnay',
    category: 'white', section: 'bourgogne-blanc',
    description: {
      fr: 'Bourgogne blanc bio. Élégance, tension, pureté du fruit.',
      en: 'Organic white Burgundy. Elegance, tension, fruit purity.',
      de: 'Bio Weißburgunder. Eleganz, Spannung, Frucht-Reinheit.',
      lb: 'Bio wäisse Burgunder. Eleganz, Spannung, Frucht-Reenheet.',
    },
    priceGlass: 22, priceBottle: 90, priceShop: 72,
    image: IMG.white2, isAvailable: true, isFeatured: true,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'aganippe',
    name: 'Aganippe',
    region: 'Bourgogne', country: 'France', grape: 'Chardonnay',
    category: 'white', section: 'bourgogne-blanc',
    description: {
      fr: 'Bourgogne naturel d\'exception. Complexe, vibrant, rare.',
      en: 'Exceptional natural Burgundy. Complex, vibrant, rare.',
      de: 'Außergewöhnlicher natürlicher Burgunder. Komplex, lebendig, selten.',
      lb: 'Aussergewéinleche natierlech Burgunder. Komplex, lieweg, seelen.',
    },
    priceGlass: 0, priceBottle: 199, priceShop: 0,
    image: IMG.white1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'chantereves-corton-charlemagne-2023',
    name: 'Chanterêves Corton-Charlemagne 2023',
    region: 'Bourgogne', country: 'France', grape: 'Chardonnay',
    category: 'white', section: 'bourgogne-blanc',
    description: {
      fr: 'Grand Cru Corton-Charlemagne. Puissance, minéralité, grandeur absolue.',
      en: 'Grand Cru Corton-Charlemagne. Power, minerality, absolute grandeur.',
      de: 'Grand Cru Corton-Charlemagne. Kraft, Mineralität, absolute Größe.',
      lb: 'Grand Cru Corton-Charlemagne. Kraaft, Mineralitéit, absolut Gréisst.',
    },
    priceGlass: 0, priceBottle: 800, priceShop: 0,
    image: IMG.white2, isAvailable: true, isFeatured: true,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },

  /* ═══════════════════════════════════════════════
     BOURGOGNE ROUGE
     ═══════════════════════════════════════════════ */
  {
    id: 'mathias-wolberg-2023',
    name: 'Mathias Wolberg 2023',
    region: 'Bourgogne', country: 'France', grape: 'Pinot Noir',
    category: 'red', section: 'bourgogne-rouge',
    description: {
      fr: 'Bourgogne rouge naturel. Cerise, terre, finesse et énergie.',
      en: 'Natural red Burgundy. Cherry, earth, finesse and energy.',
      de: 'Natürlicher roter Burgunder. Kirsche, Erde, Finesse und Energie.',
      lb: 'Natierlech route Burgunder. Kiischt, Äerd, Finesse an Energie.',
    },
    priceGlass: 0, priceBottle: 150, priceShop: 0,
    image: IMG.red2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'antonio-quari-ladoix-2023',
    name: 'Antonio Quari Les Briquottes Ladoix 2023',
    region: 'Bourgogne', country: 'France', grape: 'Pinot Noir',
    category: 'red', section: 'bourgogne-rouge',
    description: {
      fr: 'Ladoix parcellaire. Fruits rouges, finesse bourguignonne, tanins fins.',
      en: 'Single-parcel Ladoix. Red fruits, Burgundian finesse, fine tannins.',
      de: 'Einzellagen-Ladoix. Rote Früchte, burgundische Finesse, feine Tannine.',
      lb: 'Eenzel-Parzell Ladoix. Rout Friichten, burgundesch Finesse, fein Tanninen.',
    },
    priceGlass: 0, priceBottle: 275, priceShop: 0,
    image: IMG.red1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'les-horees',
    name: 'Les Horées',
    region: 'Bourgogne', country: 'France', grape: 'Pinot Noir',
    category: 'red', section: 'bourgogne-rouge',
    description: {
      fr: 'Bourgogne rouge naturel. Élégance, fruit pur, longueur remarquable.',
      en: 'Natural red Burgundy. Elegance, pure fruit, remarkable length.',
      de: 'Natürlicher roter Burgunder. Eleganz, reines Obst, bemerkenswerte Länge.',
      lb: 'Natierlech route Burgunder. Eleganz, pur Uebst, bemierkbar Längt.',
    },
    priceGlass: 0, priceBottle: 199, priceShop: 0,
    image: IMG.red2, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
  {
    id: 'perrot-minot-vosne-romanee-2021',
    name: 'Perrot Minot Vosne Romanée 2021',
    region: 'Bourgogne', country: 'France', grape: 'Pinot Noir',
    category: 'red', section: 'bourgogne-rouge',
    description: {
      fr: 'Vosne-Romanée bio. Finesse absolue, fruit délicat, terroir noble.',
      en: 'Organic Vosne-Romanée. Absolute finesse, delicate fruit, noble terroir.',
      de: 'Bio Vosne-Romanée. Absolute Finesse, zartes Obst, edles Terroir.',
      lb: 'Bio Vosne-Romanée. Absolut Finesse, zaartes Uebst, edelt Terroir.',
    },
    priceGlass: 0, priceBottle: 350, priceShop: 0,
    image: IMG.red1, isAvailable: true, isFeatured: true,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'perrot-minot-gevrey-chambertin-2021',
    name: 'Perrot Minot Gevrey-Chambertin 2021',
    region: 'Bourgogne', country: 'France', grape: 'Pinot Noir',
    category: 'red', section: 'bourgogne-rouge',
    description: {
      fr: 'Gevrey-Chambertin bio. Structure, fruits noirs, noblesse bourguignonne.',
      en: 'Organic Gevrey-Chambertin. Structure, dark fruits, Burgundian nobility.',
      de: 'Bio Gevrey-Chambertin. Struktur, dunkle Früchte, burgundische Noblesse.',
      lb: 'Bio Gevrey-Chambertin. Struktur, donkel Friichten, burgundesch Noblesse.',
    },
    priceGlass: 0, priceBottle: 300, priceShop: 0,
    image: IMG.red2, isAvailable: true, isFeatured: false,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'perrot-minot-morey-1er-cru-2021',
    name: 'Perrot Minot Morey Saint Denis 2021 1er Cru',
    region: 'Bourgogne', country: 'France', grape: 'Pinot Noir',
    category: 'red', section: 'bourgogne-rouge',
    description: {
      fr: 'Morey Saint Denis 1er Cru bio. Profondeur, complexité, grand terroir.',
      en: 'Organic Morey Saint Denis 1er Cru. Depth, complexity, great terroir.',
      de: 'Bio Morey Saint Denis 1er Cru. Tiefe, Komplexität, großes Terroir.',
      lb: 'Bio Morey Saint Denis 1er Cru. Déift, Komplexitéit, grousst Terroir.',
    },
    priceGlass: 0, priceBottle: 400, priceShop: 0,
    image: IMG.red1, isAvailable: true, isFeatured: false,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'perrot-minot-charmes-chambertin-2021',
    name: 'Perrot Minot Charmes Chambertin Grand Cru 2021',
    region: 'Bourgogne', country: 'France', grape: 'Pinot Noir',
    category: 'red', section: 'bourgogne-rouge',
    description: {
      fr: 'Grand Cru Charmes-Chambertin bio. Majestueux, profond, éternel.',
      en: 'Organic Grand Cru Charmes-Chambertin. Majestic, deep, eternal.',
      de: 'Bio Grand Cru Charmes-Chambertin. Majestätisch, tief, ewig.',
      lb: 'Bio Grand Cru Charmes-Chambertin. Majestätesch, déif, éiweg.',
    },
    priceGlass: 0, priceBottle: 500, priceShop: 0,
    image: IMG.red2, isAvailable: true, isFeatured: true,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'perrot-minot-morey-st-denis',
    name: 'Perrot Minot Morey Saint Denis',
    region: 'Bourgogne', country: 'France', grape: 'Pinot Noir',
    category: 'red', section: 'bourgogne-rouge',
    description: {
      fr: 'Morey Saint Denis village bio. Élégant, fruité, terroir expressif.',
      en: 'Organic Morey Saint Denis village. Elegant, fruity, expressive terroir.',
      de: 'Bio Morey Saint Denis Ortswein. Elegant, fruchtig, ausdrucksvolles Terroir.',
      lb: 'Bio Morey Saint Denis Duerf. Elegant, fruchteg, expressivt Terroir.',
    },
    priceGlass: 0, priceBottle: 299, priceShop: 0,
    image: IMG.red1, isAvailable: true, isFeatured: false,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'perrot-minot-chambolle-musigny-2021',
    name: 'Perrot Minot Chambolle Musigny 2021',
    region: 'Bourgogne', country: 'France', grape: 'Pinot Noir',
    category: 'red', section: 'bourgogne-rouge',
    description: {
      fr: 'Chambolle-Musigny bio. Dentelle, rose, finesse aérienne.',
      en: 'Organic Chambolle-Musigny. Lace, rose, aerial finesse.',
      de: 'Bio Chambolle-Musigny. Spitze, Rose, luftige Finesse.',
      lb: 'Bio Chambolle-Musigny. Spëtz, Rous, lofteg Finesse.',
    },
    priceGlass: 0, priceBottle: 350, priceShop: 0,
    image: IMG.red2, isAvailable: true, isFeatured: false,
    isOrganic: true, isBiodynamic: false, isNatural: false,
  },
  {
    id: 'chantereves-beaune',
    name: 'Chanterêves Beaune',
    region: 'Bourgogne', country: 'France', grape: 'Pinot Noir',
    category: 'red', section: 'bourgogne-rouge',
    description: {
      fr: 'Beaune naturel. Fruits rouges, terre, élégance bourguignonne.',
      en: 'Natural Beaune. Red fruits, earth, Burgundian elegance.',
      de: 'Natürlicher Beaune. Rote Früchte, Erde, burgundische Eleganz.',
      lb: 'Natierlech Beaune. Rout Friichten, Äerd, burgundesch Eleganz.',
    },
    priceGlass: 0, priceBottle: 150, priceShop: 0,
    image: IMG.red1, isAvailable: true, isFeatured: false,
    isOrganic: false, isBiodynamic: false, isNatural: true,
  },
];
