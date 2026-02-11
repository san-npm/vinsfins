"use client";

import { useState } from "react";
import Link from "next/link";
import { shopWines, categories } from "@/data/wines";
import { useCart } from "@/context/CartContext";

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { addToCart } = useCart();

  const filtered = activeCategory === "all"
    ? shopWines
    : shopWines.filter((w) => w.category === activeCategory || (activeCategory === "gift" && w.isGiftBox));

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/50" />
        <div className="relative z-10 text-center text-cream px-4 sm:px-6">
          <p className="uppercase tracking-luxury text-gold/70 text-[11px] mb-4 sm:mb-6">Emportez l&apos;Expérience</p>
          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-7xl font-normal mb-4 sm:mb-6">Boutique</h1>
          <p className="text-cream/45 max-w-md mx-auto font-light leading-relaxed text-sm sm:text-base">
            Our curated selection of wines, available for delivery across Luxembourg.
          </p>
        </div>
      </section>

      {/* Delivery Info */}
      <div className="border-b border-charcoal/5">
        <div className="container-custom mx-auto py-4 sm:py-5 px-4 sm:px-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[10px] sm:text-[11px] text-charcoal/35 tracking-wider uppercase">
          <span>Free delivery over €100</span>
          <span className="hidden sm:block w-px h-3 bg-charcoal/10" />
          <span>Delivery in 2–3 days</span>
          <span className="hidden sm:block w-px h-3 bg-charcoal/10" />
          <span>Gift wrapping available</span>
        </div>
      </div>

      <section className="section-padding">
        <div className="container-custom mx-auto">
          {/* Filters — horizontal scroll on mobile */}
          <div className="flex gap-3 justify-start lg:justify-center mb-10 sm:mb-16 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-3 text-[11px] tracking-luxury uppercase transition-all duration-500 whitespace-nowrap flex-shrink-0 min-h-[44px] ${
                activeCategory === "all" ? "bg-charcoal text-cream" : "text-charcoal/40 hover:text-charcoal"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-3 text-[11px] tracking-luxury uppercase transition-all duration-500 whitespace-nowrap flex-shrink-0 min-h-[44px] ${
                  activeCategory === cat.id ? "bg-charcoal text-cream" : "text-charcoal/40 hover:text-charcoal"
                }`}
              >
                {cat.label}
              </button>
            ))}
            <button
              onClick={() => setActiveCategory("gift")}
              className={`px-5 py-3 text-[11px] tracking-luxury uppercase transition-all duration-500 whitespace-nowrap flex-shrink-0 min-h-[44px] ${
                activeCategory === "gift" ? "bg-charcoal text-cream" : "text-charcoal/40 hover:text-charcoal"
              }`}
            >
              Gift Boxes
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-14">
            {filtered.map((wine) => (
              <div key={wine.id} className="wine-card group flex flex-col">
                <Link href={`/shop/${wine.id}`} className="block">
                  <div className="aspect-[3/4] overflow-hidden mb-4 sm:mb-5">
                    <img
                      src={wine.image}
                      alt={wine.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                </Link>
                <div className="flex flex-col flex-1">
                  {wine.isGiftBox && (
                    <span className="text-[10px] tracking-luxury uppercase text-gold mb-2">Gift Box</span>
                  )}
                  <p className="text-[10px] uppercase tracking-luxury text-charcoal/30 mb-2">{wine.region}</p>
                  <Link href={`/shop/${wine.id}`}>
                    <h3 className="font-playfair text-lg mb-1 hover:opacity-60 transition-opacity duration-500">{wine.name}</h3>
                  </Link>
                  <p className="text-[11px] text-charcoal/35 mb-2 font-light">{wine.grape} · {wine.vintage}</p>
                  <p className="text-xs text-charcoal/40 mb-4 sm:mb-5 line-clamp-2 font-light leading-relaxed flex-1">{wine.tastingNotes}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-charcoal/5">
                    <span className="text-burgundy text-xl font-semibold">€{wine.priceShop}</span>
                    <button
                      onClick={() => addToCart(wine)}
                      className="text-[10px] tracking-luxury uppercase bg-charcoal text-cream px-4 py-3 min-h-[44px] hover:bg-burgundy transition-colors duration-500"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
