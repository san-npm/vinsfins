"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();
  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "collect">("delivery");

  const shipping = deliveryMethod === "collect" ? 0 : (totalPrice >= 100 ? 0 : 9.9);
  const total = totalPrice + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirmed");
    clearCart();
  };

  if (step === "confirmed") {
    return (
      <div className="pt-24 px-4 sm:px-8 lg:px-20 py-24 text-center">
        <h1 className="font-playfair text-2xl sm:text-3xl mb-4">{t("checkout.confirmed")}</h1>
        <p className="text-xs text-charcoal/70 font-light mb-8">{t("checkout.thankYou")}</p>
        <Link href="/shop" className="btn-primary">{t("cart.continueShopping")}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 px-4 sm:px-8 lg:px-20 py-24 text-center">
        <p className="text-xs text-charcoal/70 font-light mb-6">{t("checkout.emptyCart")}</p>
        <Link href="/shop" className="btn-primary">{t("checkout.backToShop")}</Link>
      </div>
    );
  }

  const inputClasses = "w-full border-b border-charcoal/10 bg-transparent px-0 py-3 text-xs font-light text-charcoal placeholder:text-charcoal/80 focus:outline-none focus:border-charcoal/30 transition-all duration-300 min-h-[44px]";

  return (
    <div className="pt-24">
      <section className="px-4 sm:px-8 lg:px-20 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-playfair text-2xl sm:text-3xl mb-8">{t("checkout.title")}</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="border-t border-charcoal/5 pt-6 lg:sticky lg:top-24">
                <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-4">{t("checkout.orderSummary")}</p>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.wine.id} className="flex justify-between text-xs">
                      <span className="text-charcoal/80 font-light truncate mr-2">{item.wine.name} × {item.quantity}</span>
                      <span>€{(item.wine.priceShop * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-charcoal/5 pt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-charcoal/60">{t("checkout.shipping")}</span>
                    <span>{shipping === 0 ? t("checkout.free") : `€${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between items-baseline mt-3">
                    <span className="text-[10px] uppercase tracking-luxury text-charcoal/80">{t("checkout.total")}</span>
                    <span className="font-playfair text-lg">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-4">{t("checkout.contactInfo")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                  <input required placeholder={t("checkout.firstName")} className={inputClasses} />
                  <input required placeholder={t("checkout.lastName")} className={inputClasses} />
                  <input required type="email" placeholder={t("checkout.email")} className={`sm:col-span-2 ${inputClasses}`} />
                  <input required type="tel" placeholder={t("checkout.phone")} className={`sm:col-span-2 ${inputClasses}`} />
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-4">{t("checkout.deliveryMethod")}</p>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setDeliveryMethod("delivery")} className={`px-4 py-2 text-[10px] tracking-luxury uppercase transition-all duration-300 ${deliveryMethod === "delivery" ? "text-charcoal border-b border-charcoal" : "text-charcoal/80"}`}>{t("checkout.delivery")}</button>
                  <button type="button" onClick={() => setDeliveryMethod("collect")} className={`px-4 py-2 text-[10px] tracking-luxury uppercase transition-all duration-300 ${deliveryMethod === "collect" ? "text-charcoal border-b border-charcoal" : "text-charcoal/80"}`}>{t("checkout.clickCollect")}</button>
                </div>
              </div>

              {deliveryMethod === "delivery" ? (
                <div>
                  <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-4">{t("checkout.shippingAddress")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                    <input required placeholder={t("checkout.street")} className={`sm:col-span-2 ${inputClasses}`} />
                    <input required placeholder={t("checkout.city")} className={inputClasses} />
                    <input required placeholder={t("checkout.postalCode")} className={inputClasses} />
                    <select required className={`sm:col-span-2 ${inputClasses}`}>
                      <option value="LU">Luxembourg</option>
                      <option value="BE">Belgium</option>
                      <option value="FR">France</option>
                      <option value="DE">Germany</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-charcoal/70 font-light">
                  <p>{t("checkout.pickupAt")}: 18 Rue Münster, Grund</p>
                  <p className="mt-1">{t("checkout.pickupHours")}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-4">{t("checkout.payment")}</p>
                <div className="grid grid-cols-1 gap-y-0">
                  <input required placeholder={t("checkout.cardNumber")} className={inputClasses} />
                  <div className="grid grid-cols-2 gap-x-6">
                    <input required placeholder={t("checkout.expiry")} className={inputClasses} />
                    <input required placeholder={t("checkout.cvc")} className={inputClasses} />
                  </div>
                </div>
                <p className="text-[10px] text-charcoal/80 mt-3 font-light">{t("checkout.paymentNote")}</p>
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" required id="age" className="mt-1 min-w-[18px] min-h-[18px]" />
                <label htmlFor="age" className="text-xs text-charcoal/70 font-light">{t("checkout.ageConfirm")}</label>
              </div>

              <button type="submit" className="btn-primary w-full text-center py-4">
                {t("checkout.placeOrder")} — €{total.toFixed(2)}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
