"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function AProposPage() {
  const { t } = useLanguage();

  return (
    <main className="relative z-[1]">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
          {t("about.heroLabel")}
        </p>
        <h1 className="font-playfair text-4xl md:text-5xl text-ink font-bold mb-4">
          {t("about.heroTitle")}
        </h1>
        <p className="text-[10px] tracking-luxury uppercase text-stone">
          {t("about.estLabel")}
        </p>
      </section>

      {/* Story */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
            {t("about.passionTitle")}
          </p>
          <div className="space-y-6 text-stone font-light leading-relaxed">
            <p>{t("about.passionP1")}</p>
            <p>{t("about.passionP2")}</p>
            <p>{t("about.passionP3")}</p>
          </div>
        </div>
      </section>

      {/* Image break */}
      <section className="px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative aspect-[21/9] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=1400&h=600&fit=crop"
              alt="Wine cellar"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
            {t("about.philoLabel")}
          </p>
          <h2 className="font-playfair text-3xl text-ink mb-8">
            {t("about.philoTitle")}
          </h2>
          <div className="space-y-6 text-stone font-light leading-relaxed">
            <p>{t("about.philoP1")}</p>
            <p>{t("about.philoP2")}</p>
            <p>{t("about.philoP3")}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 bg-parchment">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <p className="font-playfair text-xl text-ink mb-3">{t("about.valuesNatural")}</p>
            <p className="text-sm text-stone font-light">{t("about.valuesNaturalDesc")}</p>
          </div>
          <div>
            <p className="font-playfair text-xl text-ink mb-3">{t("about.valuesCommunity")}</p>
            <p className="text-sm text-stone font-light">{t("about.valuesCommunityDesc")}</p>
          </div>
          <div>
            <p className="font-playfair text-xl text-ink mb-3">{t("about.valuesTerroirFirst")}</p>
            <p className="text-sm text-stone font-light">{t("about.valuesTerroirDesc")}</p>
          </div>
        </div>
      </section>

      {/* Gault & Millau */}
      <section className="py-16 px-6 bg-parchment text-center">
        <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
          Gault &amp; Millau 2024
        </p>
        <p className="font-playfair text-xl md:text-2xl text-ink italic max-w-2xl mx-auto">
          &ldquo;Une adresse incontournable pour les amateurs de vins naturels au Luxembourg.&rdquo;
        </p>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="font-playfair text-3xl text-ink mb-4">{t("about.ctaTitle")}</h2>
        <p className="text-stone font-light max-w-md mx-auto mb-8">{t("about.ctaDesc")}</p>
        <button data-zc-action="open" className="btn-wine">
          {t("about.ctaButton")}
        </button>
      </section>
    </main>
  );
}
