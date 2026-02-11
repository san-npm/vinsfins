"use client";

import { shopWines } from "@/data/wines";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams();
  const wine = shopWines.find((w) => w.id === params.id);
  const { addToCart } = useCart();
  const { t } = useLanguage();

  if (!wine) {
    return (
      <div className="pt-20 px-4 sm:px-8 lg:px-20 py-24 text-center">
        <h1 className="font-playfair text-2xl">{t("product.notFound")}</h1>
        <Link href="/shop" className="text-[10px] tracking-luxury uppercase text-charcoal/70 hover:text-charcoal border-b border-charcoal/15 pb-1 mt-6 inline-block">{t("product.backToShopBtn")}</Link>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <section className="px-4 sm:px-8 lg:px-20 py-12 sm:py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <Link href="/shop" className="text-[10px] tracking-luxury uppercase text-charcoal/60 hover:text-charcoal mb-8 inline-block transition-colors duration-500">{t("product.backToShop")}</Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16">
            <div className="aspect-[3/4] overflow-hidden">
              <img src={wine.image} alt={wine.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-2">{wine.region}</p>
              <h1 className="font-playfair text-2xl sm:text-3xl mb-2">{wine.name}</h1>
              <p className="text-xs text-charcoal/60 mb-6 font-light">{wine.grape} · {wine.vintage}</p>
              <p className="text-lg mb-6">€{wine.priceShop}</p>
              <p className="text-xs text-charcoal/70 font-light leading-relaxed mb-8">{wine.description}</p>
              <div className="border-t border-charcoal/5 pt-6 mb-8">
                <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-2">{t("product.tastingNotes")}</p>
                <p className="text-xs text-charcoal/80 font-light italic leading-relaxed">{wine.tastingNotes}</p>
              </div>
              {!wine.isGiftBox && (
                <div className="flex gap-6 mb-8 text-xs text-charcoal/60 font-light">
                  <span>{t("product.byTheGlass")}: €{wine.priceGlass}</span>
                  <span>{t("product.atRestaurant")}: €{wine.priceBottle}</span>
                </div>
              )}
              <div className="hidden sm:block">
                <button onClick={() => addToCart(wine)} className="btn-primary w-full text-center">{t("product.addToCart")} — €{wine.priceShop}</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur-md border-t border-charcoal/5 p-4 z-40">
        <button onClick={() => addToCart(wine)} className="btn-primary text-center w-full py-4 text-base">{t("product.addToCart")} — €{wine.priceShop}</button>
      </div>
    </div>
  );
}
