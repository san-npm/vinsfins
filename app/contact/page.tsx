"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <main className="relative z-[1]">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
          {t("contact.heroLabel")}
        </p>
        <h1 className="font-playfair text-4xl md:text-5xl text-ink">
          {t("contact.heroTitle")}
        </h1>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info */}
            <div className="space-y-10">
              <div>
                <h2 className="font-playfair text-2xl text-ink mb-6">{t("contact.findUs")}</h2>
                <div className="space-y-4 text-sm text-stone">
                  <div>
                    <p className="text-[10px] tracking-luxury uppercase text-gold mb-1">{t("contact.addressLabel")}</p>
                    <p>18, Rue Münster</p>
                    <p>L-2160 Luxembourg-Grund</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-luxury uppercase text-gold mb-1">{t("contact.phoneLabel")}</p>
                    <a href="tel:+35226200449" className="hover:text-ink transition-colors">+352 26 20 04 49</a>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-luxury uppercase text-gold mb-1">{t("contact.emailLabel")}</p>
                    <a href="mailto:contact@vinsfins.lu" className="hover:text-ink transition-colors">contact@vinsfins.lu</a>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-luxury uppercase text-gold mb-1">{t("contact.hoursLabel")}</p>
                    <p>Mardi – Samedi : 18h – 00h</p>
                    <p>Dimanche &amp; Lundi : Fermé</p>
                  </div>
                </div>
              </div>

              {/* Getting here */}
              <div>
                <h2 className="font-playfair text-xl text-ink mb-4">{t("contact.gettingHere")}</h2>
                <div className="space-y-3 text-sm text-stone font-light leading-relaxed">
                  <p>{t("contact.gettingHereText")}</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] tracking-luxury uppercase text-gold">Parking</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-stone">
                      <li>Parking du Grund (5 min)</li>
                      <li>Parking Saint-Esprit (via ascenseur)</li>
                      <li>Parking Monterey (10 min)</li>
                      <li>Parking Knuedler (12 min)</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] tracking-luxury uppercase text-gold mb-1">Bus</p>
                    <p className="text-sm text-stone">Ligne 23 — Arrêt Grund</p>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="flex gap-6">
                <a
                  href="https://instagram.com/vins_fins_grund"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-stone hover:text-ink transition-colors"
                >
                  Instagram →
                </a>
                <a
                  href="https://facebook.com/vins.fins.winebar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-stone hover:text-ink transition-colors"
                >
                  Facebook →
                </a>
              </div>
            </div>

            {/* Map + Reservation */}
            <div className="space-y-10">
              {/* Map */}
              <div className="relative aspect-square bg-parchment overflow-hidden border border-ink/10 shadow-lg shadow-black/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2585.8!2d6.1296!3d49.6086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDM2JzMxLjAiTiA2wrAwNyc0Ni42IkU!5e0!3m2!1sfr!2slu!4v1"
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vins Fins location"
                />
              </div>

              {/* Reservation */}
              <div className="bg-parchment p-8 border border-ink/5 text-center">
                <h2 className="font-playfair text-xl text-ink mb-3">{t("contact.reserveTitle")}</h2>
                <p className="text-sm text-stone font-light mb-6">{t("contact.reserveDesc")}</p>
                <a
                  href="https://bookings.zenchef.com/results?rid=379498"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wine"
                >
                  {t("contact.bookOnZenchef")}
                </a>
                <p className="text-xs text-stone/60 mt-4">
                  {t("contact.orCallUs")} <a href="tel:+35226200449" className="text-ink">+352 26 20 04 49</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
