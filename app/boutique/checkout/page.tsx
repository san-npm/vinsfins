"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { items, totalPrice } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <main className="relative z-[1] pt-32 pb-24 px-6 text-center">
        <h1 className="font-playfair text-3xl text-ink mb-4">{t("checkout.emptyCart")}</h1>
        <Link href="/boutique" className="btn-outline">{t("checkout.backToShop")}</Link>
      </main>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            wineId: item.wine.id,
            quantity: item.quantity,
          })),
          deliveryMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <main className="relative z-[1] pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-playfair text-3xl text-ink mb-10 text-center">{t("checkout.title")}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Options */}
          <div className="lg:col-span-3 space-y-8">
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

            {deliveryMethod === "pickup" && (
              <div className="bg-parchment p-6 border border-ink/5">
                <p className="font-playfair text-base text-ink mb-2">{t("checkout.pickupAt")}</p>
                <p className="text-sm text-stone">{t("checkout.pickupAddress")}</p>
                <p className="text-xs text-stone/60 mt-2">{t("checkout.pickupHours")}</p>
                <p className="text-xs text-stone/60 mt-1">{t("checkout.pickupNote")}</p>
              </div>
            )}

            {deliveryMethod === "delivery" && (
              <div className="bg-parchment/50 p-4 border border-ink/5 text-sm text-stone">
                {t("checkout.stripeAddressNote") || "L'adresse de livraison sera collectée lors du paiement sécurisé."}
              </div>
            )}

            <label className="flex items-start gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-wine"
              />
              <span className="text-xs text-stone">
                {t("checkout.ageConfirm")}{" "}
                <a href="/legal/cgv" target="_blank" className="underline text-wine">CGV</a>
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={!ageConfirmed || loading}
              className={`btn-wine w-full text-center ${!ageConfirmed || loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading
                ? (t("checkout.processing") || "Redirection vers le paiement...")
                : (t("checkout.proceedToPayment") || "Procéder au paiement sécurisé")}
            </button>

            <p className="text-xs text-stone/60 text-center">
              {t("checkout.stripeSecure") || "Paiement sécurisé par Stripe. Vos données bancaires ne sont jamais stockées sur notre site."}
            </p>
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
                    <p className="text-ink">{(item.wine.priceShop * item.quantity).toFixed(2)}€</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-ink/5 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone">{t("checkout.subtotal")}</span>
                  <span className="text-ink">{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone">{t("checkout.shipping")}</span>
                  <span className="text-stone">
                    {deliveryMethod === "pickup"
                      ? (t("checkout.free") || "Gratuit")
                      : totalPrice >= 100
                        ? (t("checkout.free") || "Gratuit")
                        : "5.00€"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-playfair pt-2 border-t border-ink/5">
                  <span>{t("checkout.total")}</span>
                  <span>
                    {deliveryMethod === "pickup" || totalPrice >= 100
                      ? totalPrice.toFixed(2)
                      : (totalPrice + 5).toFixed(2)}€
                  </span>
                </div>
                <p className="text-xs text-stone/50 mt-2">TVA 17% incluse / VAT 17% included</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
