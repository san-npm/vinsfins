"use client";

import { useState } from "react";
import { menuWines, categories } from "@/data/wines";
import { useLanguage } from "@/context/LanguageContext";

export default function WinesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { t } = useLanguage();

  const filtered = activeCategory === "all" ? menuWines : menuWines.filter((w) => w.category === activeCategory);

  return (
    <div>
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/25" />
        <div className="relative z-10 text-center text-cream">
          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-normal">{t("wines.heroTitle")}</h1>
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-20 py-12 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 justify-center mb-12 sm:mb-20 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button onClick={() => setActiveCategory("all")} className={`px-4 py-2 text-[10px] tracking-luxury uppercase transition-all duration-500 whitespace-nowrap flex-shrink-0 min-h-[44px] ${activeCategory === "all" ? "text-charcoal border-b border-charcoal" : "text-charcoal/80 hover:text-charcoal/80"}`}>{t("wines.allWines")}</button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 text-[10px] tracking-luxury uppercase transition-all duration-500 whitespace-nowrap flex-shrink-0 min-h-[44px] ${activeCategory === cat.id ? "text-charcoal border-b border-charcoal" : "text-charcoal/80 hover:text-charcoal/80"}`}>{cat.label}</button>
            ))}
          </div>

          <div className="space-y-0">
            {filtered.map((wine) => (
              <div key={wine.id} className="flex items-center justify-between py-5 border-b border-charcoal/5 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-playfair text-base sm:text-lg">{wine.name}</h3>
                    <span className="text-[10px] text-charcoal/80 tracking-wider hidden sm:inline">{wine.grape} · {wine.vintage}</span>
                  </div>
                  <p className="text-[10px] text-charcoal/80 tracking-wider mt-0.5">{wine.region}</p>
                </div>
                <div className="flex items-center gap-6 text-xs text-charcoal/70 flex-shrink-0 ml-4">
                  <span>€{wine.priceGlass} <span className="text-charcoal/80">/ {t("wines.glass")}</span></span>
                  <span>€{wine.priceBottle} <span className="text-charcoal/80">/ {t("wines.bottle")}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
