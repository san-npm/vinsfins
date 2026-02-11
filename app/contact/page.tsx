"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/25" />
        <div className="relative z-10 text-center text-cream">
          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-normal">{t("contact.heroTitle")}</h1>
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-20 py-12 sm:py-20 lg:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24">
            <div>
              <div className="space-y-6 mb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-2">{t("contact.addressLabel")}</p>
                  <p className="text-xs text-charcoal/80 font-light">18 Rue Münster<br />L-2160 Grund, Luxembourg</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-2">{t("contact.phoneLabel")}</p>
                  <a href="tel:+352123456" className="text-xs text-charcoal/80 hover:text-charcoal transition-colors duration-500 font-light">+352 12 34 56</a>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-2">{t("contact.emailLabel")}</p>
                  <a href="mailto:hello@vinsfins.lu" className="text-xs text-charcoal/80 hover:text-charcoal transition-colors duration-500 font-light">hello@vinsfins.lu</a>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-2">{t("contact.hoursLabel")}</p>
                  <div className="text-xs text-charcoal/70 space-y-1 font-light">
                    <p>{t("contact.hoursTueFri")}</p>
                    <p>{t("contact.hoursSat")}</p>
                    <p>{t("contact.hoursSun")}</p>
                    <p>{t("contact.hoursMon")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="aspect-video w-full overflow-hidden">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2585.8!2d6.131!3d49.6096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDM2JzM0LjYiTiA2wrAwNyc1MS42IkU!5e0!3m2!1sen!2slu!4v1234567890" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Vins Fins Location" />
              </div>

              <div id="reservation" className="border-t border-charcoal/5 pt-8">
                <h2 className="font-playfair text-xl sm:text-2xl mb-3">{t("contact.reserveTitle")}</h2>
                <p className="text-xs text-charcoal/60 mb-6 font-light">{t("contact.reserveDesc")}</p>
                <a href="https://bookings.zenchef.com/results?rid=371555" target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">{t("contact.bookOnZenchef")}</a>
                <p className="text-[10px] text-charcoal/80 mt-4 font-light">{t("contact.orCallUs")} <a href="tel:+352123456" className="text-burgundy/50 hover:text-burgundy transition-opacity duration-500">+352 12 34 56</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
