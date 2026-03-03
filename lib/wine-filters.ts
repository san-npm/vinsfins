export const WINE_FILTERS = ["all", "white", "red", "orange", "sparkling", "cider"] as const;

export const filterLabels: Record<string, Record<string, string>> = {
  all: { fr: "Tous", en: "All", de: "Alle", lb: "All" },
  white: { fr: "Blanc", en: "White", de: "Weiß", lb: "Wäiss" },
  red: { fr: "Rouge", en: "Red", de: "Rot", lb: "Rout" },
  orange: { fr: "Orange", en: "Orange", de: "Orange", lb: "Orange" },
  sparkling: { fr: "Pétillant", en: "Sparkling", de: "Schaumwein", lb: "Schaumwäin" },
  cider: { fr: "Cidre", en: "Cider", de: "Cidre", lb: "Cidre" },
};
