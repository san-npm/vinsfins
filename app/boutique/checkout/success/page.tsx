"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

interface OrderData {
  orderRef: string;
  email: string;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  deliveryMethod: string;
  items: { name: string; quantity: number; amount: number }[];
}

export default function CheckoutSuccessPage() {
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(`/api/checkout/session?session_id=${sessionId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setOrder(data);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <main className="relative z-[1] pt-32 pb-24 px-6">
      <div className="max-w-lg mx-auto text-center">
        <div className="text-5xl mb-6">🍷</div>
        <h1 className="font-playfair text-3xl text-ink mb-4">
          {t("checkout.successTitle") || "Merci pour votre commande !"}
        </h1>
        <p className="text-stone mb-8">
          {t("checkout.successMessage") || "Votre paiement a été confirmé. Vous recevrez un e-mail de confirmation sous peu."}
        </p>

        {loading && (
          <p className="text-sm text-stone/60 animate-pulse">Chargement des détails...</p>
        )}

        {order && (
          <div className="text-left bg-parchment border border-ink/5 p-6 mb-8">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-ink/5">
              <span className="text-xs text-stone uppercase tracking-wider">
                Commande / Order
              </span>
              <span className="font-playfair text-ink text-lg">#{order.orderRef}</span>
            </div>

            <div className="space-y-3 mb-4 pb-4 border-b border-ink/5">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-ink">
                    {item.name}
                    {item.quantity > 1 && <span className="text-stone"> × {item.quantity}</span>}
                  </span>
                  <span className="text-ink">{(item.amount / 100).toFixed(2)}€</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-playfair text-lg">
              <span>Total</span>
              <span>{((order.amountTotal || 0) / 100).toFixed(2)}€</span>
            </div>
            <p className="text-xs text-stone/50 mt-1 text-right">TVA 17% incluse</p>

            <div className="mt-4 pt-4 border-t border-ink/5 text-sm text-stone">
              <p>
                {order.deliveryMethod === "pickup"
                  ? "📍 Click & Collect — Vins Fins, 18 Rue Münster, Grund"
                  : "📦 Livraison à l'adresse indiquée"}
              </p>
              <p className="mt-1 text-xs text-stone/60">
                Un e-mail de confirmation vous a été envoyé.
              </p>
            </div>
          </div>
        )}

        {!loading && !order && (
          <p className="text-sm text-stone/60 mb-8">
            {t("checkout.successNote") || "Pour toute question, contactez-nous à contact@vinsfins.lu"}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/boutique" className="btn-wine">
            {t("checkout.backToShop") || "Retour à la boutique"}
          </Link>
          <Link href="/" className="btn-outline">
            {t("breadcrumbs.home") || "Accueil"}
          </Link>
        </div>
      </div>
    </main>
  );
}
