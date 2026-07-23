"use client";

import { useLanguage } from "@/context/LanguageContext";
import ZenchefShopEmbed, { zenchefShopUrl } from "@/components/ZenchefShopEmbed";

export default function ChequesCadeauxPage() {
  const { t, locale } = useLanguage();

  return (
    <main className="relative z-[1]">
      {/* Hero */}
      <section className="pt-8 pb-12 px-6 text-center">
        <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
          {t("giftVouchers.heroLabel")}
        </p>
        <h1 className="font-playfair text-4xl md:text-5xl text-ink font-bold">
          {t("giftVouchers.heroTitle")}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-sm text-stone font-light leading-relaxed">
          {t("giftVouchers.intro")}
        </p>
      </section>

      {/* Zenchef voucher shop */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <ZenchefShopEmbed locale={locale} title={t("giftVouchers.embedTitle")} />
          <p className="text-center text-xs text-stone/60 mt-6">
            {t("giftVouchers.fallbackText")}{" "}
            <a
              href={zenchefShopUrl(locale, "standalone")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline hover:text-wine transition-colors"
            >
              {t("giftVouchers.fallbackLink")}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
