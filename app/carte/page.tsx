"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import FAQSection from "@/components/FAQSection";

const categoryOrder = ["starters", "platters", "mains", "desserts", "specials"] as const;

const categoryNames: Record<string, Record<string, string>> = {
  starters: { fr: "Entrées", en: "Starters", de: "Vorspeisen", lb: "Virspäisen" },
  platters: { fr: "Planches", en: "Boards", de: "Platten", lb: "Platen" },
  mains: { fr: "Plats", en: "Mains", de: "Hauptgerichte", lb: "Haaptgeriichter" },
  desserts: { fr: "Desserts", en: "Desserts", de: "Desserts", lb: "Desserten" },
  specials: { fr: "Suggestions", en: "Specials", de: "Empfehlungen", lb: "Virschléi" },
};

export default function CartePage() {
  const { t, locale } = useLanguage();
  const { menuItems } = useData();

  return (
    <main className="relative z-[1]">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
          {t("menuPage.heroLabel")}
        </p>
        <h1 className="font-playfair text-4xl md:text-5xl text-ink">
          {t("menuPage.heroTitle")}
        </h1>
      </section>

      {/* Menu */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {categoryOrder.map((cat) => {
            const items = menuItems.filter((item) => item.category === cat && item.isAvailable);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="mb-16">
                <div className="text-center mb-10">
                  <h2 className="font-playfair text-2xl text-ink">
                    {categoryNames[cat][locale] || cat}
                  </h2>
                  <div className="mt-3 w-12 h-px bg-gold mx-auto" />
                </div>
                <div className="space-y-8">
                  {items.map((item) => (
                    <div key={item.id}>
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-playfair text-lg text-ink">
                          {item.name[locale]}
                        </h3>
                        <span className="text-sm text-ink whitespace-nowrap">
                          {item.price}€
                        </span>
                      </div>
                      <p className="text-sm text-stone font-light mt-1 leading-relaxed">
                        {item.description[locale]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Note */}
          <div className="text-center mt-8 pt-8 border-t border-ink/5">
            <p className="text-xs text-stone/60 leading-relaxed max-w-md mx-auto">
              {t("menuPage.menuNote")}
            </p>
          </div>
        </div>
      </section>

      <FAQSection
        label="Informations"
        title="À Propos de Notre Carte"
        items={[
          {
            question: "Le menu change-t-il selon les saisons ?",
            answer:
              "Oui, notre carte évolue au fil des saisons. Notre chef Sophie élabore de nouveaux plats chaque saison pour mettre en valeur les meilleurs produits locaux et créer des accords parfaits avec notre sélection de vins.",
          },
          {
            question: "Proposez-vous des options végétariennes ?",
            answer:
              "Absolument. Notre carte comprend toujours des entrées et plats végétariens. N'hésitez pas à en informer notre équipe qui pourra vous proposer des alternatives et des accords mets-vins adaptés.",
          },
          {
            question: "Faites-vous des accords mets-vins ?",
            answer:
              "C'est notre spécialité. Chaque plat est conçu pour s'accorder avec nos vins, et notre sommelier Marc se fera un plaisir de vous guider dans vos choix pour une expérience gastronomique complète.",
          },
        ]}
      />
    </main>
  );
}
