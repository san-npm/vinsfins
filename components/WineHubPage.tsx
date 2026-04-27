/**
 * Server-rendered hub page shared by /vins/luxembourg, /vins/naturel and
 * /vins/bio. Rendering on the server (not `"use client"`) means the full
 * wine list ships in the initial HTML — critical for the SEO intent these
 * hubs exist to capture.
 */
import Image from "next/image";
import Link from "next/link";
import type { Wine } from "@/data/wines";
import { getLocale, localePath, wineCategory, type Locale } from "@/lib/i18n";
import { HUBS, HUB_SLUGS, type HubSlug, winesForHub } from "@/lib/wine-hubs";

interface Props {
  slug: HubSlug;
}

const dict: Record<Locale, { shop: string; noResults: string; seeAlso: string }> = {
  fr: {
    shop: "boutique",
    noResults: "Aucun vin disponible dans cette collection pour le moment.",
    seeAlso: "Voir aussi",
  },
  en: {
    shop: "shop",
    noResults: "No wines currently available in this collection.",
    seeAlso: "See also",
  },
  de: {
    shop: "Shop",
    noResults: "Derzeit keine Weine in dieser Auswahl verfügbar.",
    seeAlso: "Siehe auch",
  },
  lb: {
    shop: "Shop",
    noResults: "Aktuell keng Wäiner an dëser Auswiel verfügbar.",
    seeAlso: "Kuckt och",
  },
};

function WineCard({ wine, locale }: { wine: Wine; locale: Locale }) {
  const cat = wineCategory[wine.category]?.[locale] || wine.category;
  return (
    <Link href={localePath(`/vins/${wine.id}`, locale)} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-parchment">
        {wine.image?.trim() ? (
          <Image
            unoptimized
            src={wine.image}
            alt={wine.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {wine.isNatural && (
            <span className="bg-emerald-700/90 text-[8px] tracking-luxury uppercase px-2 py-0.5 text-white">
              Naturel
            </span>
          )}
          {wine.isOrganic && (
            <span className="bg-white/90 text-[8px] tracking-luxury uppercase px-2 py-0.5 text-ink">
              Bio
            </span>
          )}
          {wine.isBiodynamic && (
            <span className="bg-wine/90 text-[8px] tracking-luxury uppercase px-2 py-0.5 text-white">
              Biodynamie
            </span>
          )}
        </div>
      </div>
      <p className="text-[10px] tracking-luxury uppercase text-gold mb-1">{cat}</p>
      <h3 className="font-playfair text-base text-ink mb-1">{wine.name}</h3>
      <p className="text-xs text-stone mb-1">
        {wine.region ? `${wine.region}, ` : ""}
        {wine.country}
      </p>
      <p className="text-xs text-stone/60 mb-2">{wine.grape}</p>
      <p className="text-xs text-stone/80 leading-relaxed mb-3">
        {wine.description[locale] || wine.description.fr}
      </p>
      {wine.priceShop > 0 && (
        <div className="flex items-baseline gap-3 text-sm">
          <span className="text-ink">{wine.priceShop}€</span>
          <span className="text-stone/50 text-xs">{dict[locale].shop}</span>
        </div>
      )}
    </Link>
  );
}

export default async function WineHubPage({ slug }: Props) {
  const locale = await getLocale();
  const hub = HUBS[slug];
  const hubWines = winesForHub(slug);
  const d = dict[locale];

  const otherHubs = HUB_SLUGS.filter((s) => s !== slug);

  return (
    <main className="relative z-[1]">
      <section className="pt-8 pb-12 px-6 text-center">
        <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
          {hub.eyebrow[locale]}
        </p>
        <h1 className="font-playfair text-4xl md:text-5xl text-ink font-bold mb-6">
          {hub.h1[locale]}
        </h1>
        <p className="text-stone max-w-2xl mx-auto font-light leading-relaxed">
          {hub.intro[locale]}
        </p>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          {hubWines.length === 0 ? (
            <p className="text-center text-stone">{d.noResults}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {hubWines.map((wine) => (
                <WineCard key={wine.id} wine={wine} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto border-t border-ink/10 pt-12">
          <h2 className="font-playfair text-2xl text-ink text-center mb-8">
            {d.seeAlso}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {otherHubs.map((s) => (
              <Link
                key={s}
                href={localePath(`/vins/${s}`, locale)}
                className="text-[10px] tracking-luxury uppercase px-6 py-3 border border-ink/15 text-stone hover:border-ink/40 transition-all"
              >
                {HUBS[s].h1[locale]}
              </Link>
            ))}
            <Link
              href={localePath("/vins", locale)}
              className="text-[10px] tracking-luxury uppercase px-6 py-3 border border-ink/15 text-stone hover:border-ink/40 transition-all"
            >
              {locale === "fr"
                ? "Toute la carte"
                : locale === "en"
                  ? "Full wine list"
                  : locale === "de"
                    ? "Gesamte Weinkarte"
                    : "Ganz Wäikaart"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
