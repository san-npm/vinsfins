"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function CheckoutCancelPage() {
  const { t } = useLanguage();

  return (
    <main className="relative z-[1] pt-32 pb-24 px-6 text-center">
      <div className="max-w-lg mx-auto">
        <div className="text-5xl mb-6">🔙</div>
        <h1 className="font-playfair text-3xl text-ink mb-4">
          {t("checkout.cancelTitle") || "Paiement annulé"}
        </h1>
        <p className="text-stone mb-2">
          {t("checkout.cancelMessage") || "Votre paiement n'a pas été finalisé. Votre panier est intact."}
        </p>
        <p className="text-sm text-stone/60 mb-8">
          {t("checkout.cancelNote") || "Aucun montant n'a été débité. Vous pouvez réessayer à tout moment."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/boutique/panier" className="btn-wine">
            {t("checkout.backToCart") || "Retour au panier"}
          </Link>
          <Link href="/boutique" className="btn-outline">
            {t("checkout.backToShop") || "Continuer mes achats"}
          </Link>
        </div>
      </div>
    </main>
  );
}
