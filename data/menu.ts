export interface MenuItem {
  id: string;
  category: 'starters' | 'platters' | 'mains' | 'desserts' | 'specials';
  name: Record<'fr' | 'en' | 'de' | 'lb', string>;
  description: Record<'fr' | 'en' | 'de' | 'lb', string>;
  price: number;
  isAvailable: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: 'planche-charcuterie',
    category: 'platters',
    name: {
      fr: 'Planche Charcuterie',
      en: 'Charcuterie Board',
      de: 'Wurstplatte',
      lb: 'Wurschtplat',
    },
    description: {
      fr: 'Sélection de charcuteries artisanales, cornichons, moutarde',
      en: 'Selection of artisanal cured meats, pickles, mustard',
      de: 'Auswahl an handwerklichen Wurstwaren, Cornichons, Senf',
      lb: 'Auswiel u Wurschtwaaren, Cornichonen, Moschter',
    },
    price: 18,
    isAvailable: true,
  },
  {
    id: 'planche-fromages',
    category: 'platters',
    name: {
      fr: 'Planche Fromages',
      en: 'Cheese Board',
      de: 'Käseplatte',
      lb: 'Kéisplat',
    },
    description: {
      fr: 'Fromages affinés, confiture de figues, noix',
      en: 'Aged cheeses, fig jam, walnuts',
      de: 'Gereifte Käse, Feigenmarmelade, Walnüsse',
      lb: 'Gereiften Kéis, Feigekonfitür, Nëss',
    },
    price: 16,
    isAvailable: true,
  },
  {
    id: 'planche-mixte',
    category: 'platters',
    name: {
      fr: 'Planche Mixte',
      en: 'Mixed Board',
      de: 'Gemischte Platte',
      lb: 'Gemëscht Plat',
    },
    description: {
      fr: 'Charcuterie et fromages, accompagnements maison',
      en: 'Charcuterie and cheeses with house accompaniments',
      de: 'Wurst und Käse mit hausgemachten Beilagen',
      lb: 'Wurscht a Kéis mat Hausbäilagen',
    },
    price: 22,
    isAvailable: true,
  },
  {
    id: 'carpaccio-boeuf',
    category: 'starters',
    name: {
      fr: 'Carpaccio de Bœuf',
      en: 'Beef Carpaccio',
      de: 'Rindercarpaccio',
      lb: 'Rëndscarpaccio',
    },
    description: {
      fr: 'Bœuf cru finement tranché, roquette, parmesan, huile de truffe',
      en: 'Thinly sliced raw beef, rocket, parmesan, truffle oil',
      de: 'Dünn geschnittenes rohes Rindfleisch, Rucola, Parmesan, Trüffelöl',
      lb: 'Dënn geschnidde rout Rëndfleesch, Rucola, Parmesan, Trüffelueleg',
    },
    price: 17,
    isAvailable: true,
  },
  {
    id: 'escargots',
    category: 'starters',
    name: {
      fr: 'Escargots au Beurre Persillé',
      en: 'Snails in Parsley Butter',
      de: 'Schnecken in Petersilienbutter',
      lb: 'Schnéicken an Péiterséiligebotter',
    },
    description: {
      fr: '6 escargots de Bourgogne, beurre à l\'ail et persil',
      en: '6 Burgundy snails, garlic and parsley butter',
      de: '6 Burgunderschnecken, Knoblauch-Petersilienbutter',
      lb: '6 Burgunder Schnéicken, Knuewelek-Péiterséiligebotter',
    },
    price: 14,
    isAvailable: true,
  },
  {
    id: 'olives-marinees',
    category: 'starters',
    name: {
      fr: 'Olives Marinées',
      en: 'Marinated Olives',
      de: 'Marinierte Oliven',
      lb: 'Marinéiert Oliven',
    },
    description: {
      fr: 'Olives vertes et noires aux herbes de Provence',
      en: 'Green and black olives with herbs de Provence',
      de: 'Grüne und schwarze Oliven mit Kräutern der Provence',
      lb: 'Gréng a schwaarz Oliven mat Kräider vun der Provence',
    },
    price: 6,
    isAvailable: true,
  },
  {
    id: 'houmous',
    category: 'starters',
    name: {
      fr: 'Houmous Maison',
      en: 'House Hummus',
      de: 'Hausgemachter Hummus',
      lb: 'Hausgemaachten Hummus',
    },
    description: {
      fr: 'Houmous crémeux, paprika fumé, pain grillé',
      en: 'Creamy hummus, smoked paprika, toasted bread',
      de: 'Cremiger Hummus, geräucherter Paprika, geröstetes Brot',
      lb: 'Cremegen Hummus, geréicherte Paprika, geréischtert Brout',
    },
    price: 9,
    isAvailable: true,
  },
  {
    id: 'tartine-chevre',
    category: 'mains',
    name: {
      fr: 'Tartine Chèvre Chaud',
      en: 'Warm Goat Cheese Tartine',
      de: 'Warme Ziegenkäse-Tartine',
      lb: 'Waarm Geessekéis-Tartine',
    },
    description: {
      fr: 'Pain de campagne, chèvre fondant, miel, noix',
      en: 'Country bread, melted goat cheese, honey, walnuts',
      de: 'Landbrot, geschmolzener Ziegenkäse, Honig, Walnüsse',
      lb: 'Landbrout, geschmolzene Geessekéis, Hunneg, Nëss',
    },
    price: 14,
    isAvailable: true,
  },
  {
    id: 'croque-monsieur',
    category: 'mains',
    name: {
      fr: 'Croque Monsieur',
      en: 'Croque Monsieur',
      de: 'Croque Monsieur',
      lb: 'Croque Monsieur',
    },
    description: {
      fr: 'Jambon, gruyère, béchamel, salade verte',
      en: 'Ham, gruyère, béchamel, green salad',
      de: 'Schinken, Gruyère, Béchamel, grüner Salat',
      lb: 'Ham, Gruyère, Béchamel, grénge Salat',
    },
    price: 13,
    isAvailable: true,
  },
  {
    id: 'mousse-chocolat',
    category: 'desserts',
    name: {
      fr: 'Mousse au Chocolat',
      en: 'Chocolate Mousse',
      de: 'Schokoladenmousse',
      lb: 'Schokelas Mousse',
    },
    description: {
      fr: 'Mousse au chocolat noir 70%, fleur de sel',
      en: 'Dark chocolate 70% mousse, fleur de sel',
      de: 'Zartbitterschokolade 70% Mousse, Fleur de Sel',
      lb: 'Donkel Schokela 70% Mousse, Fleur de Sel',
    },
    price: 9,
    isAvailable: true,
  },
  {
    id: 'tarte-tatin',
    category: 'desserts',
    name: {
      fr: 'Tarte Tatin',
      en: 'Tarte Tatin',
      de: 'Tarte Tatin',
      lb: 'Tarte Tatin',
    },
    description: {
      fr: 'Pommes caramélisées, crème fraîche',
      en: 'Caramelized apples, crème fraîche',
      de: 'Karamellisierte Äpfel, Crème fraîche',
      lb: 'Karamelliséiert Äppel, Crème fraîche',
    },
    price: 10,
    isAvailable: true,
  },
  {
    id: 'special-saison',
    category: 'specials',
    name: {
      fr: 'Suggestion du Chef',
      en: 'Chef\'s Special',
      de: 'Empfehlung des Küchenchefs',
      lb: 'Virschlag vum Chef',
    },
    description: {
      fr: 'Plat du jour selon le marché — demandez à votre serveur',
      en: 'Daily special based on market — ask your server',
      de: 'Tagesgericht nach Marktangebot — fragen Sie Ihren Kellner',
      lb: 'Dagsgeriicht nom Maart — frot Äre Kellner',
    },
    price: 16,
    isAvailable: true,
  },
];
