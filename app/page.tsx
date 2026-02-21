"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
export default function HomePage() {
  const { t, locale, localePath } = useLanguage();
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
          <h1 className="mb-4">
            <Image
              src="/vinsfins-logo.png"
              alt="Vins Fins"
              width={600}
              height={600}
              className="h-40 md:h-64 w-auto mx-auto brightness-0 invert"
              priority
            />
          </h1>
          <p className="text-white text-base md:text-lg tracking-luxury uppercase font-semibold mb-2">
            {t("home.heroSubtitle")}
          </p>
          <p className="text-white/80 text-sm md:text-base max-w-lg mx-auto mb-10 font-medium leading-relaxed">
            {t("home.heroDescription")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button data-zc-action="open" className="btn-wine">
              {t("home.reserveTable")}
            </button>
            <Link href={localePath("/vins")} className="btn-outline border-white/30 text-white hover:border-white/60">
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
                    <span className="absolute top-3 left-3 bg-white/90 text-ink text-[9px] tracking-luxury uppercase px-3 py-1">
                      Bio
                    </span>
                  )}
                </div>
                <h3 className="font-playfair text-lg text-ink mb-1">{wine.name}</h3>
                <p className="text-sm text-stone mb-1">{wine.region}, {wine.country}</p>
                <p className="text-xs text-stone/70 mb-2">{wine.grape}</p>
                <p className="text-sm text-stone">
                  {wine.priceGlass > 0 && (
                    <>
                      {wine.priceGlass}€ <span className="text-stone/50">{t("home.glass")}</span>
                      {" · "}
                    </>
                  )}
                  {wine.priceBottle}€ <span className="text-stone/50">{t("home.bottle")}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href={localePath("/vins")} className="btn-outline">
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
          <Link href={localePath("/carte")} className="btn-outline">
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
          <Link href={localePath("/contact")} className="btn-outline">
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
        <button data-zc-action="open" className="btn-wine">
          {t("home.ctaButton")}
        </button>
      </section>

    </main>
  );
}
