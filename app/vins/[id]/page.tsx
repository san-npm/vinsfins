"use client";

import Image from "next/image";
import Link from "next/link";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { useParams } from "next/navigation";

const categoryLabels: Record<string, string> = {
  red: "Rouge",
  white: "Blanc",
  rosé: "Rosé",
  orange: "Orange",
  sparkling: "Pétillant",
};

export default function WinePage() {
  const { id } = useParams();
  const { wines } = useData();
  const { locale } = useLanguage();
  const wine = wines.find((w) => w.id === id);

  if (!wine) {
    return (
      <main className="relative z-[1] pt-32 pb-24 px-6 text-center">
        <h1 className="font-playfair text-4xl text-ink mb-4">Vin introuvable</h1>
        <Link href="/vins" className="btn-outline">
          Retour à la Carte des Vins
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
    category: `Vin ${categoryLabels[wine.category] || wine.category}`,
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
          url: "https://vinsfins.lu",
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
                url: "https://vinsfins.lu/boutique",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="pt-28 px-6 max-w-5xl mx-auto">
        <ol className="flex items-center gap-2 text-xs text-stone/60">
          <li>
            <Link href="/" className="hover:text-ink transition-colors">
              Accueil
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/vins" className="hover:text-ink transition-colors">
              Vins
            </Link>
          </li>
          <li>/</li>
          <li className="text-ink">{wine.name}</li>
        </ol>
      </nav>

      {/* Wine Detail */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
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
              {categoryLabels[wine.category] || wine.category}
            </p>
            <h1 className="font-playfair text-3xl md:text-4xl text-ink mb-4">
              {wine.name}
            </h1>

            <div className="space-y-2 mb-6">
              <p className="text-sm text-stone">
                <span className="text-ink font-medium">Région :</span>{" "}
                {wine.region}, {wine.country}
              </p>
              <p className="text-sm text-stone">
                <span className="text-ink font-medium">Cépage :</span>{" "}
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
                    <span className="text-sm text-stone">Au verre</span>
                    <span className="font-playfair text-lg text-ink">
                      {wine.priceGlass}€
                    </span>
                  </div>
                  <div className="border-t border-ink/5" />
                </>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone">Bouteille</span>
                <span className="font-playfair text-lg text-ink">
                  {wine.priceBottle}€
                </span>
              </div>
              {wine.priceShop > 0 && (
                <>
                  <div className="border-t border-ink/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-stone">
                      Boutique en ligne
                    </span>
                    <span className="font-playfair text-lg text-ink">
                      {wine.priceShop}€
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button data-zc-action="open" className="btn-wine text-center">
                Réserver pour Déguster
              </button>
              {wine.priceShop > 0 && (
                <Link href={`/boutique/${wine.id}`} className="btn-outline text-center">
                  Acheter en Ligne
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
            Vous Aimerez Aussi
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
                  href={`/vins/${w.id}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden mb-3">
                    <Image
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
