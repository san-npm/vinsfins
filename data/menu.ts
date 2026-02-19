export interface MenuItem {
  id: string;
  category: 'starters' | 'platters' | 'carpaccios';
  name: Record<'fr' | 'en' | 'de' | 'lb', string>;
  description: Record<'fr' | 'en' | 'de' | 'lb', string>;
  price: number;
  priceLabel?: Record<'fr' | 'en' | 'de' | 'lb', string>;
  isAvailable: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: 'sardines-bertrand',
    category: 'starters',
    name: {
      fr: 'Sardines de Bertrand',
      en: 'Sardines de Bertrand',
      de: 'Sardines de Bertrand',
      lb: 'Sardines de Bertrand',
    },
    description: {
      fr: 'Citron de Menton / Vadouvan / Fenouil Sauvage de Sicile / Harissa à la Rose',
      en: 'Menton Lemon / Vadouvan / Wild Fennel from Sicily / Rose Harissa',
      de: 'Menton-Zitrone / Vadouvan / Wilder Fenchel aus Sizilien / Rosen-Harissa',
      lb: 'Menton Zitroun / Vadouvan / Wëllen Fenchel aus Sizilien / Rosen-Harissa',
    },
    price: 15,
    isAvailable: true,
  },
  {
    id: 'escargots',
    category: 'starters',
    name: {
      fr: 'Escargots au Beurre à l\'Ail',
      en: 'Escargots in Garlic Butter',
      de: 'Schnecken in Knoblauchbutter',
      lb: 'Schnéicken an Knuewelek-Botter',
    },
    description: {
      fr: 'Par 6 = 12€ / Par 12 = 19€',
      en: 'By 6 = 12€ / By 12 = 19€',
      de: '6 Stück = 12€ / 12 Stück = 19€',
      lb: '6 Stéck = 12€ / 12 Stéck = 19€',
    },
    price: 12,
    priceLabel: {
      fr: '12€ / 19€',
      en: '12€ / 19€',
      de: '12€ / 19€',
      lb: '12€ / 19€',
    },
    isAvailable: true,
  },
  {
    id: 'planche-charcuterie',
    category: 'platters',
    name: {
      fr: 'Planche Charcuterie',
      en: 'Charcuterie Platter',
      de: 'Wurstplatte',
      lb: 'Wurschtplat',
    },
    description: {
      fr: 'Jambon fumé, Saucisson & Coppa de la "Ferme Porten"',
      en: 'Smoked Ham, Saucisson & Coppa from "Ferme Porten"',
      de: 'Geräucherter Schinken, Saucisson & Coppa von der "Ferme Porten"',
      lb: 'Geréicherte Schank, Saucisson & Coppa vun der "Ferme Porten"',
    },
    price: 20,
    isAvailable: true,
  },
  {
    id: 'planche-fromages',
    category: 'platters',
    name: {
      fr: 'Planche Fromages',
      en: 'Cheese Platter',
      de: 'Käseplatte',
      lb: 'Kéisplat',
    },
    description: {
      fr: '4 fromages au lait cru de la "Ferme des Grands Vents"',
      en: '4 Different Kind of Raw-Milk Cheeses from "Ferme des Grands Vents"',
      de: '4 verschiedene Rohmilchkäsesorten von der "Ferme des Grands Vents"',
      lb: '4 verschidden Roumëllechkéis vun der "Ferme des Grands Vents"',
    },
    price: 20,
    isAvailable: true,
  },
  {
    id: 'planche-mixte',
    category: 'platters',
    name: {
      fr: 'Planche Mixte',
      en: 'Mixed Platter',
      de: 'Gemischte Platte',
      lb: 'Gemëscht Plat',
    },
    description: {
      fr: '2 fromages au lait cru de la "Ferme des Grands Vents" & 2 charcuteries de la "Ferme Porten"',
      en: '2 Kinds of Raw Cheeses from "Ferme des Grands Vents" & 2 Kinds of Charcuterie from "Ferme Porten"',
      de: '2 Rohmilchkäse von der "Ferme des Grands Vents" & 2 Wurstsorten von der "Ferme Porten"',
      lb: '2 Roumëllechkéis vun der "Ferme des Grands Vents" & 2 Wurschtsoorten vun der "Ferme Porten"',
    },
    price: 20,
    isAvailable: true,
  },
  {
    id: 'planche-canard',
    category: 'platters',
    name: {
      fr: 'Planche Canard',
      en: 'Duck Platter',
      de: 'Entenplatte',
      lb: 'Ëntenplat',
    },
    description: {
      fr: 'Rillettes de canard, Pâté de canard, Foie Gras, Pain grillé & Confiture d\'oignon',
      en: 'Duck Rillettes, Duck Pâté, Foie Gras, Toasted Bread & Onion Jam',
      de: 'Enten-Rillettes, Enten-Pastete, Foie Gras, Geröstetes Brot & Zwiebelkonfitüre',
      lb: 'Ënten-Rillettes, Ënten-Paté, Foie Gras, Geréischtert Brout & Zwiwwelkonfitür',
    },
    price: 28,
    isAvailable: true,
  },
  {
    id: 'carpaccio-betterave',
    category: 'carpaccios',
    name: {
      fr: 'Betterave Rouge',
      en: 'Red Beetroot',
      de: 'Rote Bete',
      lb: 'Rout Rommelen',
    },
    description: {
      fr: 'Pesto maison, Feta, Graines de sésame & Noix torréfiées, Salade, Vinaigrette, Pommes de terre. (+5€ avec Burrata)',
      en: 'Home-made Pesto, Feta, Roasted Sesame Seeds and Walnuts, Salad, Vinaigrette, Potatoes. (+5€ with Burrata)',
      de: 'Hausgemachtes Pesto, Feta, geröstete Sesamsamen & Walnüsse, Salat, Vinaigrette, Kartoffeln. (+5€ mit Burrata)',
      lb: 'Hausgemaachte Pesto, Feta, geréischte Sesam & Nëss, Zalot, Vinaigrette, Gromper. (+5€ mat Burrata)',
    },
    price: 20,
    priceLabel: {
      fr: '20€ / 25€ avec Burrata',
      en: '20€ / 25€ with Burrata',
      de: '20€ / 25€ mit Burrata',
      lb: '20€ / 25€ mat Burrata',
    },
    isAvailable: true,
  },
  {
    id: 'carpaccio-italien',
    category: 'carpaccios',
    name: {
      fr: 'Italien',
      en: 'Italian',
      de: 'Italienisch',
      lb: 'Italienesch',
    },
    description: {
      fr: 'Bœuf Black Angus du Müllerthal. Roquette, Parmigiano, Pesto maison, Huile d\'olive, Amandes, Sauce balsamique maison, Pommes de terre',
      en: 'Black Angus Beef from Müllerthal. Rucola, Parmigiano, Home-made Pesto, Olive Oil, Almonds, Home-made Balsamic Sauce, Potatoes',
      de: 'Black Angus Rind aus dem Müllerthal. Rucola, Parmigiano, Hausgemachtes Pesto, Olivenöl, Mandeln, Hausgemachte Balsamico-Sauce, Kartoffeln',
      lb: 'Black Angus Rënd aus dem Müllerthal. Rucola, Parmigiano, Hausgemaachte Pesto, Olivenueleg, Mandelen, Hausgemaacht Balsamico-Sauce, Gromper',
    },
    price: 25,
    isAvailable: true,
  },
  {
    id: 'carpaccio-thai',
    category: 'carpaccios',
    name: {
      fr: 'Thaï',
      en: 'Thaï',
      de: 'Thaï',
      lb: 'Thaï',
    },
    description: {
      fr: 'Bœuf Black Angus du Müllerthal. Citronnelle, Coriandre, Sauce soja, Graines de sésame & Huile torréfiées, Piment, Salade, Vinaigrette, Pommes de terre',
      en: 'Black Angus Beef from Müllerthal. Lemongrass, Coriander, Soy Sauce, Roasted Sesame Seeds & Oil, Chili, Salad, Vinaigrette, Potatoes',
      de: 'Black Angus Rind aus dem Müllerthal. Zitronengras, Koriander, Sojasauce, Geröstete Sesamsamen & Öl, Chili, Salat, Vinaigrette, Kartoffeln',
      lb: 'Black Angus Rënd aus dem Müllerthal. Zitronegras, Koriander, Soja-Sauce, Geréischte Sesam & Ueleg, Chili, Zalot, Vinaigrette, Gromper',
    },
    price: 25,
    isAvailable: true,
  },
  {
    id: 'carpaccio-truffe',
    category: 'carpaccios',
    name: {
      fr: 'La Truffe',
      en: 'The Truffle',
      de: 'Der Trüffel',
      lb: 'Den Trüffel',
    },
    description: {
      fr: 'Bœuf Black Angus du Müllerthal. Huile d\'olive à la truffe, Tartufata, Mayonnaise à la truffe, Ciboulette, Pommes de terre. (+/- 30€ avec 5gr. de truffe noire fraîche)',
      en: 'Black Angus Beef from Müllerthal. Truffle Olive Oil, Tartufata, Truffle Mayonnaise, Chives, Potatoes. (+/- 30€ with 5gr. of fresh black truffle)',
      de: 'Black Angus Rind aus dem Müllerthal. Trüffel-Olivenöl, Tartufata, Trüffel-Mayonnaise, Schnittlauch, Kartoffeln. (+/- 30€ mit 5g frischem schwarzem Trüffel)',
      lb: 'Black Angus Rënd aus dem Müllerthal. Trüffel-Olivenueleg, Tartufata, Trüffel-Mayonnaise, Schnëttlach, Gromper. (+/- 30€ mat 5g frëschem schwaarzen Trüffel)',
    },
    price: 25,
    isAvailable: true,
  },
];
