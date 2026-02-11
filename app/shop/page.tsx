"use client";

import { useState } from "react";
import Link from "next/link";
import { shopWines, categories } from "@/data/wines";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const filtered = activeCategory === "all" ? shopWines : shopWines.filter((w) => w.category === activeCategory || (activeCategory === "gift" && w.isGiftBox));

  return (
    <div>
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/25" />
        <div className="relative z-10 text-center text-cream">
          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-normal">{t("shop.heroTitle")}</h1>
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-20 py-12 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 justify-start lg:justify-center mb-10 sm:mb-16 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button onClick={() => setActiveCategory("all")} className={`px-4 py-2 text-[10px] tracking-luxury uppercase transition-all duration-500 whitespace-nowrap flex-shrink-0 min-h-[44px] ${activeCategory === "all" ? "text-charcoal border-b border-charcoal" : "text-charcoal/80 hover:text-charcoal/80"}`}>{t("shop.all")}</button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 text-[10px] tracking-luxury uppercase transition-all duration-500 whitespace-nowrap flex-shrink-0 min-h-[44px] ${activeCategory === cat.id ? "text-charcoal border-b border-charcoal" : "text-charcoal/80 hover:text-charcoal/80"}`}>{cat.label}</button>
            ))}
            <button onClick={() => setActiveCategory("gift")} className={`px-4 py-2 text-[10px] tracking-luxury uppercase transition-all duration-500 whitespace-nowrap flex-shrink-0 min-h-[44px] ${activeCategory === "gift" ? "text-charcoal border-b border-charcoal" : "text-charcoal/80 hover:text-charcoal/80"}`}>{t("shop.giftBoxes")}</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-14">
            {filtered.map((wine) => (
              <div key={wine.id} className="group flex flex-col">
                <Link href={`/shop/${wine.id}`} className="block">
                  <div className="aspect-[3/4] overflow-hidden mb-4">
                    <img src={wine.image} alt={wine.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                  </div>
                </Link>
                <Link href={`/shop/${wine.id}`}><h3 className="font-playfair text-base mb-1 hover:opacity-50 transition-opacity duration-500">{wine.name}</h3></Link>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-charcoal/5">
                  <span className="text-sm">€{wine.priceShop}</span>
                  <button onClick={() => addToCart(wine)} className="text-[10px] tracking-luxury uppercase text-charcoal/60 hover:text-charcoal transition-colors duration-500">{t("shop.addToCart")}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
