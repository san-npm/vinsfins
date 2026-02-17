"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
const categories = ["all", "red", "white", "rosé", "orange", "sparkling"] as const;

const categoryLabels: Record<string, Record<string, string>> = {
  all: { fr: "Tous", en: "All", de: "Alle", lb: "All" },
  red: { fr: "Rouge", en: "Red", de: "Rot", lb: "Rout" },
  white: { fr: "Blanc", en: "White", de: "Weiß", lb: "Wäiss" },
  "rosé": { fr: "Rosé", en: "Rosé", de: "Rosé", lb: "Rosé" },
  orange: { fr: "Orange", en: "Orange", de: "Orange", lb: "Orange" },
  sparkling: { fr: "Pétillant", en: "Sparkling", de: "Schaumwein", lb: "Schaumwäin" },
};

export default function VinsPage() {
  const { t, locale, localePath } = useLanguage();
  const { wines } = useData();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = activeCategory === "all"
    ? wines
    : wines.filter((w) => w.category === activeCategory);

  return (
    <main className="relative z-[1]">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
          {t("wines.heroLabel")}
        </p>
        <h1 className="font-playfair text-4xl md:text-5xl text-ink">
          {t("wines.heroTitle")}
        </h1>
      </section>

      {/* Filters */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] tracking-luxury uppercase px-5 py-2 border transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-ink text-cream border-ink"
                  : "border-ink/15 text-stone hover:border-ink/40"
              }`}
            >
              {categoryLabels[cat][locale] || cat}
            </button>
          ))}
        </div>
      </section>

      {/* Wine Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((wine) => (
            <Link key={wine.id} href={localePath(`/vins/${wine.id}`)} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-parchment">
                <Image
                  src={wine.image}
                  alt={wine.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {wine.isOrganic && (
                    <span className="bg-white/90 text-[8px] tracking-luxury uppercase px-2 py-0.5 text-ink">
                      Bio
                    </span>
                  )}
                  {wine.isBiodynamic && (
                    <span className="bg-wine/90 text-[8px] tracking-luxury uppercase px-2 py-0.5 text-white">
                      Biodynamie
                    </span>
                  )}
                </div>
              </div>
              <h3 className="font-playfair text-base text-ink mb-1">{wine.name}</h3>
              <p className="text-xs text-stone mb-1">{wine.region}, {wine.country}</p>
              <p className="text-xs text-stone/60 mb-2">{wine.grape}</p>
              <p className="text-xs text-stone/80 leading-relaxed mb-3">
                {wine.description[locale]}
              </p>
              <div className="flex items-baseline gap-3 text-sm">
                <span className="text-ink">{wine.priceGlass}€</span>
                <span className="text-stone/50 text-xs">{t("wines.glass")}</span>
                <span className="text-stone/30">·</span>
                <span className="text-ink">{wine.priceBottle}€</span>
                <span className="text-stone/50 text-xs">{t("wines.bottle")}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}
