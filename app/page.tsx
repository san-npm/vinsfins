"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import FAQSection from "@/components/FAQSection";

export default function HomePage() {
  const { t, locale } = useLanguage();
  const { wines } = useData();
  const featuredWines = wines.filter((w) => w.isFeatured);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="relative z-[1]">
      {/* Hero */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center">
        <div ref={heroRef} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1920&h=1080&fit=crop"
            alt="Wine bar ambiance"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="font-script text-7xl md:text-9xl text-white mb-4 animate-handwrite">
            Vins Fins
          </h1>
          <p className="text-white/80 text-sm md:text-base tracking-luxury uppercase font-light mb-2">
            {t("home.heroSubtitle")}
          </p>
          <p className="text-white/60 text-sm max-w-lg mx-auto mb-10 font-light leading-relaxed">
            {t("home.heroDescription")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://bookings.zenchef.com/results?rid=379498"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wine"
            >
              {t("home.reserveTable")}
            </a>
            <Link href="/vins" className="btn-outline border-white/30 text-white hover:border-white/60">
              {t("home.discoverWines")}
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] tracking-luxury uppercase text-gold mb-6">
            {t("home.introTitle")}
          </p>
          <p className="text-lg md:text-xl text-stone leading-relaxed font-light">
            {t("home.introText")}
          </p>
        </div>
      </section>

      {/* Featured Wines */}
      <section className="py-20 px-6 bg-parchment">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
              {t("home.featuredLabel")}
            </p>
            <h2 className="font-playfair text-3xl md:text-4xl text-ink">
              {t("home.featuredTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredWines.slice(0, 6).map((wine) => (
              <div key={wine.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden mb-4">
                  <Image
                    src={wine.image}
                    alt={wine.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {wine.isOrganic && (
                    <span className="absolute top-3 left-3 bg-dark-card/90 text-cream text-[9px] tracking-luxury uppercase px-3 py-1">
                      Bio
                    </span>
                  )}
                </div>
                <h3 className="font-playfair text-lg text-ink mb-1">{wine.name}</h3>
                <p className="text-sm text-stone mb-1">{wine.region}, {wine.country}</p>
                <p className="text-xs text-stone/70 mb-2">{wine.grape}</p>
                <p className="text-sm text-stone">
                  {wine.priceGlass}€ <span className="text-stone/50">{t("home.glass")}</span>
                  {" · "}
                  {wine.priceBottle}€ <span className="text-stone/50">{t("home.bottle")}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/vins" className="btn-outline">
              {t("home.viewCollection")}
            </Link>
          </div>
        </div>
      </section>

      {/* Menu teaser */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
            {t("home.cuisineLabel")}
          </p>
          <h2 className="font-playfair text-3xl md:text-4xl text-ink mb-6">
            {t("home.menuTitle")}
          </h2>
          <p className="text-stone font-light leading-relaxed mb-8">
            {t("home.menuDesc")}
          </p>
          <Link href="/carte" className="btn-outline">
            {t("home.viewMenu")}
          </Link>
        </div>
      </section>

      {/* Press / Gault & Millau */}
      <section className="py-16 px-6 bg-parchment">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
            Gault &amp; Millau 2024
          </p>
          <p className="font-playfair text-xl md:text-2xl text-ink italic">
            &ldquo;Une adresse incontournable pour les amateurs de vins naturels au Luxembourg.&rdquo;
          </p>
        </div>
      </section>

      {/* Visit section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
            {t("home.visitLabel")}
          </p>
          <h2 className="font-playfair text-3xl md:text-4xl text-ink mb-6">
            {t("home.visitTitle")}
          </h2>
          <p className="text-stone font-light mb-2">18, Rue Münster</p>
          <p className="text-stone font-light mb-2">L-2160 Luxembourg-Grund</p>
          <p className="text-stone font-light mb-8">Mardi – Samedi · 18h – 00h</p>
          <Link href="/contact" className="btn-outline">
            {t("home.findUs")}
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-dark-card text-cream text-center">
        <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
          {t("home.ctaLabel")}
        </p>
        <h2 className="font-playfair text-3xl md:text-4xl mb-6">
          {t("home.ctaTitle")}
        </h2>
        <p className="text-cream/60 font-light max-w-lg mx-auto mb-8">
          {t("home.ctaDesc")}
        </p>
        <a
          href="https://bookings.zenchef.com/results?rid=379498"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-wine"
        >
          {t("home.ctaButton")}
        </a>
      </section>

      {/* FAQ Section */}
      <FAQSection
        items={[
          {
            question: "Où se trouve Vins Fins à Luxembourg ?",
            answer:
              "Vins Fins est situé au 18 Rue Münster, dans le quartier historique du Grund à Luxembourg (L-2160). Accessible par l'ascenseur gratuit du Grund depuis le Plateau du Saint-Esprit.",
          },
          {
            question: "Faut-il réserver chez Vins Fins ?",
            answer:
              "La réservation est recommandée, particulièrement le vendredi et samedi soir. Vous pouvez réserver en ligne via ZenChef ou par téléphone. Les places au bar sont disponibles sans réservation.",
          },
          {
            question: "Quels types de vins proposez-vous ?",
            answer:
              "Notre carte propose plus de 80 références de vins naturels, bio et biodynamiques. Nous sélectionnons des vins de vignerons artisans de la Loire, Bourgogne, Beaujolais, Provence, Rhône, ainsi que des vins luxembourgeois de la Moselle.",
          },
          {
            question: "Quels sont les horaires d'ouverture ?",
            answer:
              "Vins Fins est ouvert du mardi au samedi de 18h à minuit. Nous sommes fermés le dimanche et le lundi.",
          },
          {
            question: "Proposez-vous des vins au verre ?",
            answer:
              "Oui, une large sélection de nos vins est disponible au verre, avec une rotation régulière pour vous faire découvrir de nouvelles références. Les prix au verre commencent à partir de 8€.",
          },
          {
            question: "Peut-on acheter des bouteilles à emporter ?",
            answer:
              "Absolument. Notre boutique en ligne propose une sélection de nos vins en livraison dans tout le Luxembourg. Vous pouvez également acheter des bouteilles directement au restaurant.",
          },
        ]}
      />
    </main>
  );
}
