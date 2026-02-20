"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <main className="relative z-[1] pt-32 pb-24 px-6 text-center">
        <h1 className="font-playfair text-3xl text-ink mb-4">{t("checkout.confirmed")}</h1>
        <p className="text-stone mb-2">{t("checkout.thankYou")}</p>
        <p className="text-xs text-stone/60 mb-8">{t("checkout.mockNote")}</p>
        <Link href="/" className="btn-outline">Home</Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="relative z-[1] pt-32 pb-24 px-6 text-center">
        <h1 className="font-playfair text-3xl text-ink mb-4">{t("checkout.emptyCart")}</h1>
        <Link href="/boutique" className="btn-outline">{t("checkout.backToShop")}</Link>
      </main>
    );
  }

  return (
    <main className="relative z-[1] pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-playfair text-3xl text-ink mb-10 text-center">{t("checkout.title")}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3 space-y-8">
            {/* Contact */}
            <div>
              <h2 className="font-playfair text-xl text-ink mb-4">{t("checkout.contactInfo")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input placeholder={t("checkout.firstName")} className="border border-ink/15 bg-white/50 px-4 py-3 text-sm" />
                <input placeholder={t("checkout.lastName")} className="border border-ink/15 bg-white/50 px-4 py-3 text-sm" />
                <input placeholder={t("checkout.email")} type="email" className="border border-ink/15 bg-white/50 px-4 py-3 text-sm sm:col-span-2" />
                <input placeholder={t("checkout.phone")} type="tel" className="border border-ink/15 bg-white/50 px-4 py-3 text-sm sm:col-span-2" />
              </div>
            </div>

            {/* Delivery method */}
            <div>
              <h2 className="font-playfair text-xl text-ink mb-4">{t("checkout.deliveryMethod")}</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`flex-1 border px-4 py-4 text-sm text-left transition-all ${
                    deliveryMethod === "delivery" ? "border-ink bg-parchment" : "border-ink/15"
                  }`}
                >
                  <span className="font-medium text-ink block">{t("checkout.delivery")}</span>
                  <span className="text-xs text-stone">{t("checkout.deliveryDesc")}</span>
                </button>
                <button
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`flex-1 border px-4 py-4 text-sm text-left transition-all ${
                    deliveryMethod === "pickup" ? "border-ink bg-parchment" : "border-ink/15"
                  }`}
                >
                  <span className="font-medium text-ink block">{t("checkout.clickCollect")}</span>
                  <span className="text-xs text-stone">{t("checkout.clickCollectDesc")}</span>
                </button>
              </div>
            </div>

            {deliveryMethod === "delivery" ? (
              <div>
                <h2 className="font-playfair text-xl text-ink mb-4">{t("checkout.shippingAddress")}</h2>
                <div className="space-y-4">
                  <input placeholder={t("checkout.street")} className="w-full border border-ink/15 bg-white/50 px-4 py-3 text-sm" />
                  <input placeholder={t("checkout.apartment")} className="w-full border border-ink/15 bg-white/50 px-4 py-3 text-sm" />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder={t("checkout.city")} className="border border-ink/15 bg-white/50 px-4 py-3 text-sm" />
                    <input placeholder={t("checkout.postalCode")} className="border border-ink/15 bg-white/50 px-4 py-3 text-sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-parchment p-6 border border-ink/5">
                <p className="font-playfair text-base text-ink mb-2">{t("checkout.pickupAt")}</p>
                <p className="text-sm text-stone">{t("checkout.pickupAddress")}</p>
                <p className="text-xs text-stone/60 mt-2">{t("checkout.pickupHours")}</p>
                <p className="text-xs text-stone/60 mt-1">{t("checkout.pickupNote")}</p>
              </div>
            )}

            {/* Payment */}
            <div>
              <h2 className="font-playfair text-xl text-ink mb-4">{t("checkout.payment")}</h2>
              <div className="space-y-4">
                <input placeholder={t("checkout.cardNumber")} className="w-full border border-ink/15 bg-white/50 px-4 py-3 text-sm" />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder={t("checkout.expiry")} className="border border-ink/15 bg-white/50 px-4 py-3 text-sm" />
                  <input placeholder={t("checkout.cvc")} className="border border-ink/15 bg-white/50 px-4 py-3 text-sm" />
                </div>
                <p className="text-xs text-stone/60">{t("checkout.paymentNote")}</p>
              </div>
            </div>

            <div className="text-xs text-stone/60 mb-4">
              {t("checkout.ageConfirm")}
            </div>

            <button
              onClick={() => { setConfirmed(true); clearCart(); }}
              className="btn-wine w-full text-center"
            >
              {t("checkout.placeOrder")}
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-parchment p-6 border border-ink/5 sticky top-28">
              <h2 className="font-playfair text-xl text-ink mb-6">{t("checkout.orderSummary")}</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.wine.id} className="flex justify-between text-sm">
                    <div>
                      <p className="text-ink">{item.wine.name}</p>
                      <p className="text-xs text-stone">{t("checkout.qty")}: {item.quantity}</p>
                    </div>
                    <p className="text-ink">{item.wine.priceShop * item.quantity}€</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-ink/5 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone">{t("checkout.subtotal")}</span>
                  <span className="text-ink">{totalPrice}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone">{t("checkout.shipping")}</span>
                  <span className="text-stone">{totalPrice >= 100 ? t("checkout.free") : "5€"}</span>
                </div>
                <div className="flex justify-between text-lg font-playfair pt-2 border-t border-ink/5">
                  <span>{t("checkout.total")}</span>
                  <span>{totalPrice >= 100 ? totalPrice : totalPrice + 5}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
