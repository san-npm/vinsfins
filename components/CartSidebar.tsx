"use client";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function CartSidebar() {
  const { items, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const { t } = useLanguage();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50 animate-fade-in-overlay" onClick={() => setIsCartOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-cream z-50 flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-6 border-b border-charcoal/5">
          <h2 className="font-playfair text-lg">{t("cartSidebar.title")}</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-charcoal/60 hover:text-charcoal min-w-[44px] min-h-[44px] flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-charcoal/60 font-light mb-6">{t("cartSidebar.empty")}</p>
              <Link href="/shop" onClick={() => setIsCartOpen(false)} className="text-[10px] tracking-luxury uppercase text-charcoal/70 hover:text-charcoal border-b border-charcoal/15 pb-1 transition-colors duration-500">{t("cartSidebar.browseWines")}</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.wine.id} className="flex gap-4">
                  <div className="w-14 h-18 flex-shrink-0 overflow-hidden">
                    <img src={item.wine.image} alt={item.wine.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-light text-charcoal truncate">{item.wine.name}</h4>
                    <p className="text-[10px] text-charcoal/60">{item.wine.vintage}</p>
                    <p className="text-xs text-charcoal/60 mt-1">€{item.wine.priceShop}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.wine.id, item.quantity - 1)} className="w-7 h-7 border border-charcoal/10 flex items-center justify-center text-xs hover:border-charcoal/30 transition-colors">−</button>
                      <span className="text-xs w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.wine.id, item.quantity + 1)} className="w-7 h-7 border border-charcoal/10 flex items-center justify-center text-xs hover:border-charcoal/30 transition-colors">+</button>
                      <button onClick={() => removeFromCart(item.wine.id)} className="ml-auto text-charcoal/80 hover:text-charcoal/80 transition-colors text-[10px] tracking-wider uppercase">{t("cart.remove")}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-charcoal/5 p-6 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] uppercase tracking-luxury text-charcoal/60">{t("cartSidebar.total")}</span>
              <span className="font-playfair text-xl">€{totalPrice.toFixed(2)}</span>
            </div>
            <Link href="/shop/checkout" onClick={() => setIsCartOpen(false)} className="btn-primary block text-center w-full">{t("cartSidebar.checkout")}</Link>
          </div>
        )}
      </div>
    </>
  );
}
