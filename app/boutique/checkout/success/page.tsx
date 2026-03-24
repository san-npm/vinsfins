"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccessPage() {
  const { t } = useLanguage();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="relative z-[1] pt-32 pb-24 px-6 text-center">
      <div className="max-w-lg mx-auto">
        <div className="text-5xl mb-6">🍷</div>
        <h1 className="font-playfair text-3xl text-ink mb-4">
          {t("checkout.successTitle") || "Merci pour votre commande !"}
        </h1>
        <p className="text-stone mb-2">
          {t("checkout.successMessage") || "Votre paiement a été confirmé. Vous recevrez un e-mail de confirmation sous peu."}
        </p>
        <p className="text-sm text-stone/60 mb-8">
          {t("checkout.successNote") || "Pour toute question, contactez-nous à contact@vinsfins.lu"}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/boutique" className="btn-wine">
            {t("checkout.backToShop") || "Retour à la boutique"}
          </Link>
          <Link href="/" className="btn-outline">
            {t("nav.home") || "Accueil"}
          </Link>
        </div>
      </div>
    </main>
  );
}
