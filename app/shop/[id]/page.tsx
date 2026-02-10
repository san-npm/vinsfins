"use client";

import { shopWines } from "@/data/wines";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams();
  const wine = shopWines.find((w) => w.id === params.id);
  const { addToCart } = useCart();

  if (!wine) {
    return (
      <div className="pt-20 section-padding text-center">
        <h1 className="font-playfair text-3xl">Wine not found</h1>
        <Link href="/shop" className="btn-outline mt-6 inline-block">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <section className="section-padding">
        <div className="container-custom mx-auto">
          <Link href="/shop" className="text-burgundy text-sm font-semibold uppercase tracking-wide hover:text-burgundy/70 mb-8 inline-block">
            ← Back to Shop
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-[3/4] bg-white rounded-sm overflow-hidden">
              <img src={wine.image} alt={wine.name} className="w-full h-full object-cover" />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              {wine.isGiftBox && (
                <span className="text-xs bg-gold/20 text-gold px-3 py-1 rounded-full font-semibold uppercase w-fit mb-4">
                  Gift Box
                </span>
              )}
              <p className="uppercase tracking-[0.2em] text-gold text-sm mb-2">{wine.region}</p>
              <h1 className="font-playfair text-3xl sm:text-4xl mb-2">{wine.name}</h1>
              <p className="text-charcoal/50 mb-6">{wine.grape} · {wine.vintage} · {wine.country}</p>

              <div className="text-burgundy font-bold text-3xl mb-6">€{wine.priceShop}</div>

              <p className="text-charcoal/70 leading-relaxed mb-8">{wine.description}</p>

              <div className="bg-burgundy/5 rounded-sm p-6 mb-8">
                <h3 className="font-playfair text-lg mb-2">Tasting Notes</h3>
                <p className="text-charcoal/70 italic">&ldquo;{wine.tastingNotes}&rdquo;</p>
              </div>

              {!wine.isGiftBox && (
                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                  <div className="bg-white p-4 rounded-sm">
                    <span className="text-charcoal/50">By the Glass</span>
                    <span className="block font-bold text-lg text-burgundy mt-1">€{wine.priceGlass}</span>
                  </div>
                  <div className="bg-white p-4 rounded-sm">
                    <span className="text-charcoal/50">At the Restaurant</span>
                    <span className="block font-bold text-lg text-charcoal mt-1">€{wine.priceBottle}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => addToCart(wine)}
                className="btn-primary text-center text-lg py-4"
              >
                Add to Cart — €{wine.priceShop}
              </button>

              <p className="text-xs text-charcoal/40 mt-4 text-center">
                Free delivery on orders over €100 within Luxembourg
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
