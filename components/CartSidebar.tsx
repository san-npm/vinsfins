"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

export default function CartSidebar() {
  const { t } = useLanguage();
  const { items, updateQuantity, removeFromCart, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[70]"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-dark-light z-[80] animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream/5">
          <h2 className="font-playfair text-xl text-cream">{t("cartSidebar.title")}</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-cream p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-stone mb-2">{t("cartSidebar.empty")}</p>
              <p className="text-xs text-stone/60 mb-6">{t("cartSidebar.emptyDesc")}</p>
              <Link href="/boutique" onClick={() => setIsCartOpen(false)} className="btn-outline text-xs inline-block !border-cream/20 !text-cream hover:!border-cream/50">
                {t("cartSidebar.browseWines")}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.wine.id} className="flex gap-3 border-b border-cream/5 pb-4">
                  <div className="relative w-14 h-20 flex-shrink-0 bg-dark-card overflow-hidden">
                    <Image src={item.wine.image} alt={item.wine.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cream truncate">{item.wine.name}</p>
                    <p className="text-xs text-stone">{item.wine.priceShop}€</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.wine.id, item.quantity - 1)}
                        className="w-6 h-6 border border-cream/15 text-xs text-cream"
                      >
                        −
                      </button>
                      <span className="text-xs w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.wine.id, item.quantity + 1)}
                        className="w-6 h-6 border border-cream/15 text-xs text-cream"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.wine.id)}
                        className="ml-auto text-[10px] text-stone hover:text-wine"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-cream/5 space-y-3">
            <p className="text-xs text-stone/60">{t("cartSidebar.shippingNote")}</p>
            <div className="flex justify-between font-playfair text-lg text-cream">
              <span>{t("cartSidebar.total")}</span>
              <span>{totalPrice}€</span>
            </div>
            <Link
              href="/boutique/checkout"
              onClick={() => setIsCartOpen(false)}
              className="btn-wine w-full text-center block"
            >
              {t("cartSidebar.checkout")}
            </Link>
            <Link
              href="/boutique/panier"
              onClick={() => setIsCartOpen(false)}
              className="btn-outline w-full text-center block !border-cream/20 !text-cream hover:!border-cream/50"
            >
              {t("cartSidebar.viewCart")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
