"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

export default function PanierPage() {
  const { t } = useLanguage();
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="relative z-[1] pt-32 pb-24 px-6 text-center">
        <h1 className="font-playfair text-3xl text-ink mb-4">{t("cart.title")}</h1>
        <p className="text-stone mb-8">{t("cart.empty")}</p>
        <Link href="/boutique" className="btn-outline">{t("cart.continueShopping")}</Link>
      </main>
    );
  }

  return (
    <main className="relative z-[1] pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-playfair text-3xl text-ink mb-10 text-center">{t("cart.title")}</h1>

        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.wine.id} className="flex gap-4 items-center border-b border-ink/5 pb-6">
              <div className="relative w-20 h-28 flex-shrink-0 bg-parchment overflow-hidden">
                <Image src={item.wine.image} alt={item.wine.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-playfair text-base text-ink">{item.wine.name}</h3>
                <p className="text-xs text-stone">{item.wine.region}</p>
                <p className="text-sm text-ink mt-1">{item.wine.priceShop}€</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.wine.id, item.quantity - 1)}
                  className="w-8 h-8 border border-ink/15 text-ink text-sm hover:border-ink/40 transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.wine.id, item.quantity + 1)}
                  className="w-8 h-8 border border-ink/15 text-ink text-sm hover:border-ink/40 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-ink w-16 text-right">
                {item.wine.priceShop * item.quantity}€
              </p>
              <button
                onClick={() => removeFromCart(item.wine.id)}
                className="text-xs text-stone hover:text-wine transition-colors"
              >
                {t("cart.remove")}
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-10 border-t border-ink/10 pt-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone">{t("cart.subtotal")}</span>
            <span className="text-ink">{totalPrice}€</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-stone">{t("cart.shipping")}</span>
            <span className="text-stone">{t("cart.shippingNote")}</span>
          </div>
          <div className="flex justify-between text-lg font-playfair mb-8">
            <span>{t("cart.total")}</span>
            <span>{totalPrice}€</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/boutique/checkout" className="btn-wine text-center flex-1">
              {t("cart.checkout")}
            </Link>
            <button onClick={clearCart} className="btn-outline text-center flex-1">
              {t("cart.clearCart")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
