"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  const team = [
    { name: "Marc Duval", roleKey: "marcRole", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop" },
    { name: "Sophie Laurent", roleKey: "sophieRole", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop" },
    { name: "Thomas Weber", roleKey: "thomasRole", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop" },
  ];

  return (
    <div>
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/25" />
        <div className="relative z-10 text-center text-cream">
          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-normal">{t("about.heroTitle")}</h1>
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-20 py-16 sm:py-24 lg:py-40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center mb-20 sm:mb-32">
            <div>
              <h2 className="font-playfair text-2xl sm:text-3xl mb-6 leading-tight">{t("about.passionTitle")}</h2>
              <p className="text-xs text-charcoal/70 font-light leading-relaxed mb-4">{t("about.passionP1")}</p>
              <p className="text-xs text-charcoal/70 font-light leading-relaxed">{t("about.passionP2")}</p>
            </div>
            <div className="aspect-[4/5] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=600&h=750&fit=crop" alt="Wine cellar" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center mb-20 sm:mb-32">
            <div className="aspect-[4/5] overflow-hidden order-2 lg:order-1">
              <img src="https://images.unsplash.com/photo-1560148218-1a83060f7b32?w=600&h=750&fit=crop" alt="Natural winemaking" className="w-full h-full object-cover" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-playfair text-2xl sm:text-3xl mb-6 leading-tight">{t("about.philoTitle")}</h2>
              <p className="text-xs text-charcoal/70 font-light leading-relaxed mb-4">{t("about.philoP1")}</p>
              <p className="text-xs text-charcoal/70 font-light leading-relaxed">{t("about.philoP2")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-20 sm:mb-32">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="aspect-[4/5] overflow-hidden mb-4">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-playfair text-base mb-1">{member.name}</h3>
                <p className="text-[10px] uppercase tracking-luxury text-charcoal/80">{t(`about.${member.roleKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 text-center px-4">
        <h2 className="font-playfair text-2xl sm:text-3xl mb-4">{t("about.ctaTitle")}</h2>
        <Link href="/contact#reservation" className="text-[10px] tracking-luxury uppercase text-charcoal/60 hover:text-charcoal border-b border-charcoal/15 pb-1 transition-colors duration-500">{t("about.ctaButton")}</Link>
      </section>
    </div>
  );
}
