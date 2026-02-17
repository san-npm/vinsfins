"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
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

export default function BoutiquePage() {
  const { t, locale, localePath } = useLanguage();
  const { addToCart } = useCart();
  const { wines } = useData();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const shopWines = wines.filter((w) => w.priceShop > 0);
  const filtered = activeCategory === "all"
    ? shopWines
    : shopWines.filter((w) => w.category === activeCategory);

  return (
    <main className="relative z-[1]">
      <section className="pt-32 pb-8 px-6 text-center">
        <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
          {t("shop.heroLabel")}
        </p>
        <h1 className="font-playfair text-4xl md:text-5xl text-ink mb-4">
          {t("shop.heroTitle")}
        </h1>
        <p className="text-stone font-light max-w-lg mx-auto">
          {t("shop.heroDesc")}
        </p>
      </section>

      {/* Badges */}
      <section className="px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6 text-xs text-stone">
          <span>🚚 {t("shop.freeDelivery")}</span>
          <span>📦 {t("shop.deliveryTime")}</span>
          <span>🎁 {t("shop.giftWrapping")}</span>
        </div>
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

      {/* Products Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((wine) => (
            <div key={wine.id} className="group flex flex-col h-full">
              <Link href={localePath(`/boutique/${wine.id}`)}>
                <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-parchment">
                  <Image
                    src={wine.image}
                    alt={wine.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </Link>
              <div className="flex flex-col flex-1">
                <Link href={localePath(`/boutique/${wine.id}`)}>
                  <h3 className="font-playfair text-base text-ink mb-1 hover:text-wine transition-colors">
                    {wine.name}
                  </h3>
                </Link>
                <p className="text-xs text-stone mb-2">{wine.region}, {wine.country}</p>
                <div className="mt-auto">
                  <p className="text-lg text-ink mb-3">{wine.priceShop}€</p>
                  <button
                    onClick={() => addToCart(wine)}
                    className="btn-wine text-[9px] w-full text-center"
                  >
                    {t("shop.addToCart")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
