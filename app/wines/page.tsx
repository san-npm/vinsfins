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
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="relative z-10 text-center text-cream px-4">
          <p className="uppercase tracking-[0.2em] text-gold text-sm mb-4">Our Collection</p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold">Wine List</h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom mx-auto">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${
                  activeCategory === "all"
                    ? "bg-burgundy text-cream"
                    : "bg-white text-charcoal hover:bg-burgundy/10"
                }`}
              >
                All Wines
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${
                    activeCategory === cat.id
                      ? "bg-burgundy text-cream"
                      : "bg-white text-charcoal hover:bg-burgundy/10"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-charcoal/10 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-burgundy"
            >
              <option value="name">Sort by Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="region">Sort by Region</option>
            </select>
          </div>

          {/* Wine Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sorted.map((wine) => (
              <div key={wine.id} className="wine-card bg-white rounded-sm overflow-hidden group">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={wine.image}
                    alt={wine.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase tracking-wider text-gold">{wine.category}</span>
                    <span className="text-charcoal/30">·</span>
                    <span className="text-xs text-charcoal/50">{wine.region}</span>
                  </div>
                  <h3 className="font-playfair text-xl mb-1">{wine.name}</h3>
                  <p className="text-sm text-charcoal/50 mb-3">{wine.grape} · {wine.vintage}</p>
                  <p className="text-sm text-charcoal/70 mb-4 italic">&ldquo;{wine.tastingNotes}&rdquo;</p>
                  <div className="flex items-center justify-between pt-4 border-t border-charcoal/5">
                    <div>
                      <span className="text-burgundy font-bold text-lg">€{wine.priceGlass}</span>
                      <span className="text-charcoal/50 text-sm ml-1">/ glass</span>
                    </div>
                    <div>
                      <span className="text-charcoal font-semibold">€{wine.priceBottle}</span>
                      <span className="text-charcoal/50 text-sm ml-1">/ bottle</span>
                    </div>
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
