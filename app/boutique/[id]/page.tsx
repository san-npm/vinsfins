"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useData } from "@/context/DataContext";

export default function ProductPage() {
  const { t, locale, localePath } = useLanguage();
  const { addToCart } = useCart();
  const { wines } = useData();
  const params = useParams();
  const wine = wines.find((w) => w.id === params.id);

  if (!wine) {
    return (
      <main className="relative z-[1] pt-32 pb-24 px-6 text-center">
        <h1 className="font-playfair text-3xl text-ink mb-6">{t("product.notFound")}</h1>
        <Link href={localePath("/boutique")} className="btn-outline">{t("product.backToShopBtn")}</Link>
      </main>
    );
  }

  return (
    <main className="relative z-[1] pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href={localePath("/boutique")} className="text-sm text-stone hover:text-ink transition-colors mb-8 inline-block">
          {t("product.backToShop")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          {/* Image */}
          <div className="relative aspect-[3/4] bg-dark-card overflow-hidden">
            <Image
              src={wine.image}
              alt={wine.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {wine.isOrganic && (
                <span className="bg-dark-card/90 text-[8px] tracking-luxury uppercase px-2 py-0.5 text-ink">
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

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="text-[10px] tracking-luxury uppercase text-gold mb-3">
              {wine.region}, {wine.country}
            </p>
            <h1 className="font-playfair text-3xl md:text-4xl text-ink mb-2">{wine.name}</h1>
            <p className="text-sm text-stone mb-6">{wine.grape}</p>

            <div className="mb-8">
              <p className="text-[10px] tracking-luxury uppercase text-stone mb-3">
                {t("product.tastingNotes")}
              </p>
              <p className="text-stone font-light leading-relaxed">
                {wine.description[locale]}
              </p>
            </div>

            {/* Prices */}
            <div className="border-t border-b border-ink/5 py-6 mb-8 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone">{t("product.byTheGlass")}</span>
                <span className="text-ink">{wine.priceGlass}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone">{t("product.atRestaurant")}</span>
                <span className="text-ink">{wine.priceBottle}€</span>
              </div>
            </div>

            {/* Shop price + Add to cart */}
            {wine.priceShop > 0 && (
              <div>
                <p className="text-3xl text-ink mb-4">{wine.priceShop}€</p>
                <button
                  onClick={() => addToCart(wine)}
                  className="btn-wine w-full text-center"
                >
                  {t("product.addToCart")}
                </button>
                <p className="text-xs text-stone/60 mt-3 text-center">
                  {t("product.freeDelivery")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
