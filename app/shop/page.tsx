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
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="relative z-10 text-center text-cream px-4">
          <p className="uppercase tracking-[0.2em] text-gold text-sm mb-4">Take It Home</p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold">E-Shop</h1>
          <p className="text-cream/80 mt-4 max-w-xl mx-auto">
            Browse our curated selection of wines available for delivery across Luxembourg.
          </p>
        </div>
      </section>

      {/* Delivery Info */}
      <section className="bg-burgundy/5 border-b border-burgundy/10">
        <div className="container-custom mx-auto py-4 px-4 flex flex-wrap items-center justify-center gap-6 text-sm text-charcoal/70">
          <span>🚚 Free delivery over €100</span>
          <span className="text-charcoal/20">|</span>
          <span>📦 Delivery within Luxembourg in 2-3 days</span>
          <span className="text-charcoal/20">|</span>
          <span>🎁 Gift wrapping available</span>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${
                activeCategory === "all" ? "bg-burgundy text-cream" : "bg-white text-charcoal hover:bg-burgundy/10"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${
                  activeCategory === cat.id ? "bg-burgundy text-cream" : "bg-white text-charcoal hover:bg-burgundy/10"
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
            <button
              onClick={() => setActiveCategory("gift")}
              className={`px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${
                activeCategory === "gift" ? "bg-burgundy text-cream" : "bg-white text-charcoal hover:bg-burgundy/10"
              }`}
            >
              🎁 Gift Boxes
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((wine) => (
              <div key={wine.id} className="wine-card bg-white rounded-sm overflow-hidden group flex flex-col">
                <Link href={`/shop/${wine.id}`} className="block">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={wine.image}
                      alt={wine.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  {wine.isGiftBox && (
                    <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-semibold uppercase w-fit mb-2">
                      Gift Box
                    </span>
                  )}
                  <p className="text-xs uppercase tracking-wider text-charcoal/40 mb-1">{wine.region}</p>
                  <Link href={`/shop/${wine.id}`}>
                    <h3 className="font-playfair text-lg mb-1 hover:text-burgundy transition-colors">{wine.name}</h3>
                  </Link>
                  <p className="text-xs text-charcoal/50 mb-2">{wine.grape} · {wine.vintage}</p>
                  <p className="text-sm text-charcoal/60 mb-4 line-clamp-2 flex-1">{wine.tastingNotes}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-burgundy font-bold text-xl">€{wine.priceShop}</span>
                    <button
                      onClick={() => addToCart(wine)}
                      className="bg-burgundy text-cream px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wide hover:bg-burgundy/90 transition-colors"
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
