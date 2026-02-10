export interface MenuItem {
  name: string;
  description: string;
  price: number;
  winePairing?: string;
  isSpecial?: boolean;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const menuSections: MenuSection[] = [
  {
    title: "Starters",
    items: [
      {
        name: "Foie Gras Mi-Cuit",
        description: "House-made duck foie gras with fig chutney and toasted brioche",
        price: 22,
        winePairing: "Trimbach Riesling Cuvée Frédéric Émile",
      },
      {
        name: "Burrata & Heirloom Tomatoes",
        description: "Creamy burrata with multicolored tomatoes, basil oil, and fleur de sel",
        price: 16,
        winePairing: "Miraval Rosé",
      },
      {
        name: "Tartare de Bœuf",
        description: "Hand-cut beef tartare with capers, shallots, and truffle oil",
        price: 19,
        winePairing: "Marcel Lapierre Morgon",
      },
      {
        name: "Soupe à l'Oignon Gratinée",
        description: "Classic French onion soup with Gruyère crouton",
        price: 14,
      },
      {
        name: "Ceviche de Saint-Jacques",
        description: "Scallop ceviche with yuzu, pink pepper, and micro herbs",
        price: 21,
        winePairing: "Domaine Vacheron Sancerre",
        isSpecial: true,
      },
    ],
  },
  {
    title: "Main Courses",
    items: [
      {
        name: "Magret de Canard",
        description: "Pan-seared duck breast with cherry gastrique, potato gratin, and seasonal vegetables",
        price: 32,
        winePairing: "Château de Beaucastel Châteauneuf-du-Pape",
      },
      {
        name: "Filet de Bar",
        description: "Sea bass fillet with beurre blanc, crushed new potatoes, and samphire",
        price: 29,
        winePairing: "Domaine Dauvissat Chablis 1er Cru",
      },
      {
        name: "Entrecôte Grillée",
        description: "Grilled rib-eye steak with béarnaise sauce, hand-cut frites, and watercress",
        price: 34,
        winePairing: "E. Guigal Côte-Rôtie",
      },
      {
        name: "Risotto aux Cèpes",
        description: "Porcini mushroom risotto with aged Parmesan and truffle shavings",
        price: 26,
        winePairing: "Dugat-Py Gevrey-Chambertin",
      },
      {
        name: "Bouillabaisse du Chef",
        description: "Provençal fish stew with rouille, croutons, and Gruyère",
        price: 28,
        winePairing: "Miraval Rosé",
        isSpecial: true,
      },
    ],
  },
  {
    title: "Cheese",
    items: [
      {
        name: "Plateau de Fromages",
        description: "Selection of 5 artisanal cheeses with honey, walnuts, and fruit paste",
        price: 18,
        winePairing: "Château de Beaucastel Châteauneuf-du-Pape",
      },
      {
        name: "Camembert Rôti",
        description: "Baked Camembert with garlic, rosemary, and toasted sourdough",
        price: 15,
        winePairing: "Marcel Lapierre Morgon",
      },
    ],
  },
  {
    title: "Desserts",
    items: [
      {
        name: "Tarte Tatin",
        description: "Caramelized apple tart with crème fraîche and Calvados",
        price: 14,
        winePairing: "Dom Pérignon",
      },
      {
        name: "Fondant au Chocolat",
        description: "Dark chocolate fondant with vanilla bean ice cream",
        price: 13,
        winePairing: "Château de Beaucastel Châteauneuf-du-Pape",
      },
      {
        name: "Crème Brûlée à la Lavande",
        description: "Lavender-infused crème brûlée with shortbread biscuit",
        price: 12,
      },
      {
        name: "Assiette de Fruits",
        description: "Seasonal fruit plate with sorbet and mint",
        price: 11,
      },
    ],
  },
];

export const seasonalSpecials = {
  title: "Seasonal Specials — Winter 2026",
  description: "Our chef's seasonal creations, available for a limited time.",
  items: [
    {
      name: "Ceviche de Saint-Jacques",
      description: "Scallop ceviche with yuzu, pink pepper, and micro herbs",
      price: 21,
    },
    {
      name: "Bouillabaisse du Chef",
      description: "Provençal fish stew with rouille, croutons, and Gruyère",
      price: 28,
    },
    {
      name: "Chevreuil Rôti",
      description: "Roast venison loin with juniper jus, parsnip purée, and red cabbage",
      price: 36,
    },
  ],
};
