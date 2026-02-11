"use client";

import { useState } from "react";
import { menuWines, categories } from "@/data/wines";

export default function WinesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const filtered = activeCategory === "all"
    ? menuWines
    : menuWines.filter((w) => w.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.priceGlass - b.priceGlass;
    if (sortBy === "price-desc") return b.priceGlass - a.priceGlass;
    if (sortBy === "region") return a.region.localeCompare(b.region);
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/50" />
        <div className="relative z-10 text-center text-cream px-4 sm:px-6">
          <p className="uppercase tracking-luxury text-gold/70 text-[11px] mb-4 sm:mb-6">Notre Collection</p>
          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-7xl font-normal">Wine List</h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom mx-auto">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-10 sm:mb-16 pb-6 sm:pb-8 border-b border-charcoal/5">
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap w-full sm:w-auto">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-5 py-3 text-[11px] tracking-luxury uppercase transition-all duration-500 whitespace-nowrap flex-shrink-0 min-h-[44px] ${
                  activeCategory === "all"
                    ? "bg-charcoal text-cream"
                    : "text-charcoal/40 hover:text-charcoal"
                }`}
              >
                All Wines
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-3 text-[11px] tracking-luxury uppercase transition-all duration-500 whitespace-nowrap flex-shrink-0 min-h-[44px] ${
                    activeCategory === cat.id
                      ? "bg-charcoal text-cream"
                      : "text-charcoal/40 hover:text-charcoal"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-b border-charcoal/15 px-0 py-2 text-xs text-charcoal/50 focus:outline-none focus:border-charcoal/30 tracking-wide min-h-[44px]"
            >
              <option value="name">Sort by Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="region">Sort by Region</option>
            </select>
          </div>

          {/* Wine Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-16">
            {sorted.map((wine) => (
              <div key={wine.id} className="wine-card group">
                <div className="aspect-[3/4] overflow-hidden mb-4 sm:mb-6">
                  <img
                    src={wine.image}
                    alt={wine.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                </div>
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <span className="text-[10px] uppercase tracking-luxury text-gold/70">{wine.category}</span>
                  <span className="text-charcoal/15">·</span>
                  <span className="text-[10px] text-charcoal/30 tracking-wider">{wine.region}</span>
                </div>
                <h3 className="font-playfair text-lg sm:text-xl mb-2">{wine.name}</h3>
                <p className="text-xs text-charcoal/35 mb-2 sm:mb-3 font-light">{wine.grape} · {wine.vintage}</p>
                <p className="text-sm text-charcoal/45 mb-4 sm:mb-5 italic font-light leading-relaxed">&ldquo;{wine.tastingNotes}&rdquo;</p>
                <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-charcoal/5">
                  <div>
                    <span className="text-burgundy text-lg">€{wine.priceGlass}</span>
                    <span className="text-charcoal/30 text-xs ml-1 font-light">/ glass</span>
                  </div>
                  <div>
                    <span className="text-charcoal/60">€{wine.priceBottle}</span>
                    <span className="text-charcoal/30 text-xs ml-1 font-light">/ bottle</span>
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
