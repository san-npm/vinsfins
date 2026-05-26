"use client";

import Link from "next/link";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { useParams, notFound } from "next/navigation";
import WineImage from "@/components/WineImage";
import WineBadges from "@/components/WineBadges";
import { SHOP_ENABLED, WINE_IMAGES_ENABLED } from "@/lib/flags";

const categoryLabels: Record<string, Record<string, string>> = {
  red: { fr: "Rouge", en: "Red", de: "Rot", lb: "Rout" },
  white: { fr: "Blanc", en: "White", de: "Weiß", lb: "Wäiss" },
  rosé: { fr: "Rosé", en: "Rosé", de: "Rosé", lb: "Rosé" },
  orange: { fr: "Orange", en: "Orange", de: "Orange", lb: "Orange" },
  sparkling: { fr: "Pétillant", en: "Sparkling", de: "Schaumwein", lb: "Schaumwäin" },
};

export default function WinePage() {
  const { id } = useParams<{ id: string }>();
  const { wines } = useData();
  const { t, locale, localePath } = useLanguage();
  const wine = wines.find((w) => w.id === id);

  if (!wine) {
    // notFound() routes to app/not-found.tsx so search engines see a real
    // 404 boundary instead of a soft "not found" UI returned with status 200.
    notFound();
  }

  return (
    <main className="relative z-[1]">
      {/* Product JSON-LD emitted server-side in layout.tsx — single source of truth */}

      {/* Wine Detail — breadcrumb rendered by layout */}
      <section className="pt-4 py-12 px-6">
        <div className={WINE_IMAGES_ENABLED ? "max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12" : "max-w-3xl mx-auto"}>
          {/* Image */}
          <WineImage
            src={wine.image}
            alt={wine.name}
            wrapperClassName="relative aspect-[3/4] overflow-hidden"
            imageClassName="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          >
            <div className="absolute top-4 left-4 flex gap-2">
              {wine.isOrganic && (
                <span className="bg-white/90 text-[9px] tracking-luxury uppercase px-3 py-1 text-ink">
                  Bio
                </span>
              )}
              {wine.isBiodynamic && (
                <span className="bg-white/90 text-[9px] tracking-luxury uppercase px-3 py-1 text-ink">
                  Biodynamie
                </span>
              )}
            </div>
          </WineImage>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="text-[10px] tracking-luxury uppercase text-gold mb-3">
              {categoryLabels[wine.category]?.[locale] || wine.category}
            </p>
            <h1 className="font-playfair text-3xl md:text-4xl text-ink mb-4">
              {wine.name}
            </h1>

            <WineBadges wine={wine} />

            <div className="space-y-2 mb-6">
              <p className="text-sm text-stone">
                <span className="text-ink font-medium">{t("wines.region")} :</span>{" "}
                {wine.region}, {wine.country}
              </p>
              <p className="text-sm text-stone">
                <span className="text-ink font-medium">{t("wines.grape")} :</span>{" "}
                {wine.grape}
              </p>
            </div>

            <p className="text-stone font-light leading-relaxed mb-8">
              {wine.description?.[locale] || wine.description?.fr}
            </p>

            {SHOP_ENABLED && wine.priceShop > 0 && (
              <div className="mb-8 p-6 bg-parchment">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone">{t("wines.byTheBottle")}</span>
                  <span className="font-playfair text-lg text-ink">
                    {wine.priceShop}€
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://bookings.zenchef.com/results?rid=371555" data-zc-action="open" target="_blank" rel="noopener noreferrer" className="btn-wine text-center">
                {t("wines.reserveToTaste")}
              </a>
              {SHOP_ENABLED && wine.priceShop > 0 && (
                <Link href={localePath(`/boutique/${wine.id}`)} className="btn-outline text-center">
                  {t("wines.buyOnline")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Wines */}
      <section className="py-16 px-6 bg-parchment">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-playfair text-2xl text-ink mb-8 text-center">
            {t("wines.youMayAlsoLike")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {wines
              .filter(
                (w) =>
                  w.id !== wine.id &&
                  (w.category === wine.category || w.region === wine.region)
              )
              .slice(0, 3)
              .map((w) => (
                <Link
                  key={w.id}
                  href={localePath(`/vins/${w.id}`)}
                  className="group"
                >
                  <WineImage
                    src={w.image}
                    alt={w.name}
                    wrapperClassName="relative aspect-[3/4] overflow-hidden mb-3"
                    sizes="33vw"
                  />
                  <h3 className="font-playfair text-sm text-ink mb-1">
                    {w.name}
                  </h3>
                  <p className="text-xs text-stone">
                    {w.region}, {w.country}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
