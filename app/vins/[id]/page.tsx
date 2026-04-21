"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { useParams } from "next/navigation";

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
    return (
      <main className="relative z-[1] pt-8 pb-24 px-6 text-center">
        <h1 className="font-playfair text-4xl text-ink mb-4">{t("wines.notFound")}</h1>
        <Link href={localePath("/vins")} className="btn-outline">
          {t("wines.backToWines")}
        </Link>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: wine.name,
    description: wine.description?.fr || "",
    image: wine.image,
    brand: {
      "@type": "Brand",
      name: wine.name.split(" ").slice(0, 2).join(" "),
    },
    category: `Vin ${categoryLabels[wine.category]?.fr || wine.category}`,
    countryOfOrigin: {
      "@type": "Country",
      name: wine.country,
    },
    offers: [
      {
        "@type": "Offer",
        name: "Bouteille",
        price: wine.priceBottle.toString(),
        priceCurrency: "EUR",
        availability: wine.isAvailable
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Restaurant",
          name: "Vins Fins",
          url: "https://www.vinsfins.lu",
        },
      },
      ...(wine.priceShop > 0
        ? [
            {
              "@type": "Offer",
              name: "Boutique en ligne",
              price: wine.priceShop.toString(),
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              seller: {
                "@type": "Store",
                name: "Vins Fins — Boutique",
                url: "https://www.vinsfins.lu/boutique",
              },
            },
          ]
        : []),
    ],
    additionalProperty: [
      { "@type": "PropertyValue", name: "Région", value: wine.region },
      { "@type": "PropertyValue", name: "Cépage", value: wine.grape },
      ...(wine.isOrganic
        ? [{ "@type": "PropertyValue", name: "Agriculture", value: "Bio" }]
        : []),
      ...(wine.isBiodynamic
        ? [{ "@type": "PropertyValue", name: "Agriculture", value: "Biodynamique" }]
        : []),
    ],
  };

  return (
    <main className="relative z-[1]">
      <Script
        id={`wine-jsonld-${wine.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Wine Detail — breadcrumb rendered by layout */}
      <section className="pt-4 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              unoptimized
              src={wine.image}
              alt={wine.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
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
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="text-[10px] tracking-luxury uppercase text-gold mb-3">
              {categoryLabels[wine.category]?.[locale] || wine.category}
            </p>
            <h1 className="font-playfair text-3xl md:text-4xl text-ink mb-4">
              {wine.name}
            </h1>

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

            <div className="space-y-3 mb-8 p-6 bg-parchment">
              {wine.priceGlass > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-stone">{t("wines.byTheGlass")}</span>
                    <span className="font-playfair text-lg text-ink">
                      {wine.priceGlass}€
                    </span>
                  </div>
                  <div className="border-t border-ink/5" />
                </>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone">{t("wines.byTheBottle")}</span>
                <span className="font-playfair text-lg text-ink">
                  {wine.priceBottle}€
                </span>
              </div>
              {wine.priceShop > 0 && (
                <>
                  <div className="border-t border-ink/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-stone">
                      {t("wines.onlineShop")}
                    </span>
                    <span className="font-playfair text-lg text-ink">
                      {wine.priceShop}€
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://bookings.zenchef.com/results?rid=371555" data-zc-action="open" target="_blank" rel="noopener noreferrer" className="btn-wine text-center">
                {t("wines.reserveToTaste")}
              </a>
              {wine.priceShop > 0 && (
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
                  <div className="relative aspect-[3/4] overflow-hidden mb-3">
                    <Image
              unoptimized
                      src={w.image}
                      alt={w.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="33vw"
                    />
                  </div>
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
