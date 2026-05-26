import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import ConsentBanner from "@/components/ConsentBanner";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { DataProvider } from "@/context/DataContext";
import Script from "next/script";
import { getLocale, getNonce, pageMeta, SITE_URL, localeUrl, locales } from "@/lib/i18n";
import { playfairDisplay, sourceSans3 } from "@/lib/fonts";
import { SHOP_ENABLED } from "@/lib/flags";
import { businessProfile } from "@/data/content";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1a1a1a",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const meta = pageMeta.home[locale];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: meta.title,
      template: `%s | Vins Fins Luxembourg`,
    },
    description: meta.description,
    keywords:
      "bar à vins, restaurant, Luxembourg, Grund, vin naturel, vin bio, cuisine française, cave à vins, wine bar, Weinbar",
    authors: [{ name: "Vins Fins" }],
    creator: "Vins Fins",
    publisher: "Vins Fins",
    formatDetection: { telephone: true, email: true, address: true },
    alternates: {
      canonical: localeUrl("/", locale),
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, localeUrl("/", l)])),
        "x-default": SITE_URL,
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: SITE_URL,
      siteName: "Vins Fins",
      locale: locale === "fr" ? "fr_FR" : locale === "de" ? "de_DE" : locale === "lb" ? "lb_LU" : "en_US",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Vins Fins — Bar à Vins au Grund, Luxembourg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: [`${SITE_URL}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
  };
}

/**
 * AggregateRating from the live Google Business Profile (Vins Fins, Grund,
 * Luxembourg). Numbers must reflect reality — Google penalises Product /
 * LocalBusiness Rich Results when the in-page value disagrees with what
 * Google itself has on file. Update these when you pull fresh counts.
 */
const GOOGLE_RATING = {
  value: 4.6 as number | null,
  count: 0 as number,
};

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: businessProfile.streetAddress,
  addressLocality: businessProfile.addressLocality,
  addressRegion: businessProfile.addressRegion,
  postalCode: businessProfile.postalCode,
  addressCountry: businessProfile.addressCountry,
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  // Schema.org publishes BarOrPub as the standard hospitality type for a
  // bar/pub establishment; WineBar is not a recognised type. Restaurant +
  // BarOrPub is the defensible pairing for a wine-bar-with-kitchen.
  "@type": ["Restaurant", "BarOrPub"],
  "@id": `${SITE_URL}/#restaurant`,
  ...(GOOGLE_RATING.value !== null && GOOGLE_RATING.count > 0
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: GOOGLE_RATING.value.toFixed(1),
          reviewCount: GOOGLE_RATING.count,
          bestRating: "5",
          worstRating: "1",
        },
      }
    : {}),
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".hero-description", ".opening-hours"],
  },
  name: businessProfile.name,
  description:
    "Bar à vins & restaurant au Grund, Luxembourg. 730 vins naturels, bio et biodynamiques de 18 pays, sélectionnés chez des vignerons artisans, accompagnés d'une cuisine française de saison.",
  url: SITE_URL,
  telephone: businessProfile.telephone,
  email: businessProfile.email,
  address: postalAddress,
  geo: {
    "@type": "GeoCoordinates",
    latitude: businessProfile.geo.latitude,
    longitude: businessProfile.geo.longitude,
  },
  openingHoursSpecification: businessProfile.openingHours.map((slot) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: slot.dayOfWeek,
    opens: slot.opens,
    closes: slot.closes,
  })),
  priceRange: businessProfile.priceRange,
  servesCuisine: ["French", "Wine Bar"],
  acceptsReservations: true,
  areaServed: [
    { "@type": "Country", name: "Luxembourg" },
    { "@type": "Country", name: "France" },
    { "@type": "Country", name: "Germany" },
    { "@type": "Country", name: "Belgium" },
  ],
  menu: `${SITE_URL}/carte`,
  hasMenu: { "@type": "Menu", url: `${SITE_URL}/carte` },
  image: `${SITE_URL}/og-image.jpg`,
  sameAs: [businessProfile.socials.instagram, businessProfile.socials.facebook],
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: businessProfile.reservationUrl,
    },
    result: {
      "@type": "FoodEstablishmentReservation",
      name: "Réservation Vins Fins",
    },
  },
};

const storeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${SITE_URL}/#store`,
  name: "Vins Fins — Boutique en Ligne",
  description: "730 vins naturels, bio et biodynamiques de 18 pays. Livraison Luxembourg et Europe (FR/DE/BE).",
  url: `${SITE_URL}/boutique`,
  telephone: businessProfile.telephone,
  email: businessProfile.email,
  address: postalAddress,
  priceRange: "€–€€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Credit Card",
  areaServed: [
    { "@type": "Country", name: "Luxembourg" },
    { "@type": "Country", name: "France" },
    { "@type": "Country", name: "Germany" },
    { "@type": "Country", name: "Belgium" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Wine Catalog",
    numberOfItems: 730,
    itemListElement: [
      { "@type": "OfferCatalog", name: "Natural Wines" },
      { "@type": "OfferCatalog", name: "Organic Wines" },
      { "@type": "OfferCatalog", name: "Biodynamic Wines" },
    ],
  },
  shippingDetails: {
    "@type": "OfferShippingDetails",
    shippingDestination: [
      { "@type": "DefinedRegion", addressCountry: "LU" },
      { "@type": "DefinedRegion", addressCountry: "FR" },
      { "@type": "DefinedRegion", addressCountry: "DE" },
      { "@type": "DefinedRegion", addressCountry: "BE" },
    ],
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      businessDays: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"] },
      transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 7, unitCode: "d" },
    },
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Vins Fins",
  inLanguage: ["fr-FR", "en-US", "de-DE", "lb-LU"],
  publisher: { "@id": `${SITE_URL}/#restaurant` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/boutique?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const nonce = await getNonce();

  return (
    <html lang={locale}>
      <head>
        <Script
          id="json-ld-restaurant"
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd).replace(/</g, "\\u003c") }}
        />
        <Script
          id="json-ld-store"
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd).replace(/</g, "\\u003c") }}
        />
        <Script
          id="json-ld-website"
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
        />
        {/* FAQPage JSON-LD lives on /contact only, where the visible FAQ
            renders. A site-wide FAQ schema misrepresents pages that don't
            contain the questions and weakens AI-engine trust. */}
      </head>
      <body className={`${playfairDisplay.variable} ${sourceSans3.variable}`}>
        <LanguageProvider>
          <DataProvider>
            <CartProvider>
              <Navigation />
              {children}
              <Footer />
              {SHOP_ENABLED && <CartSidebar />}
              <ConsentBanner />
            </CartProvider>
          </DataProvider>
        </LanguageProvider>
        <div className="zc-widget-config" data-restaurant="371555" data-open="2000" />
        <Script id="zenchef-loader" strategy="afterInteractive" nonce={nonce}>{`
          ;(function (d, s, id) {
            var el = d.getElementsByTagName(s)[0];
            if (d.getElementById(id) || !el || !el.parentNode) return;
            var js = d.createElement(s);
            js.id = id;
            js.src = 'https://sdk.zenchef.com/v1/sdk.min.js';
            el.parentNode.insertBefore(js, el);
          })(document, 'script', 'zenchef-sdk');
        `}</Script>
        <Script id="gtag-default-consent" strategy="beforeInteractive" nonce={nonce}>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // Advanced Consent Mode v2: deny everything by default until
          // the visitor makes a choice via the ConsentBanner. The CMP
          // fires gtag('consent', 'update', ...) to flip signals.
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted',
            wait_for_update: 500,
          });
          gtag('js', new Date());
        `}</Script>
        <Script
          id="gtag-loader"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-5HP3962G9E"
          nonce={nonce}
        />
        <Script id="gtag-config" strategy="afterInteractive" nonce={nonce}>{`
          gtag('config', 'G-5HP3962G9E');
        `}</Script>
      </body>
    </html>
  );
}
