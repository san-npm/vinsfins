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

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "WineBar"],
  "@id": `${SITE_URL}/#restaurant`,
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".hero-description", ".opening-hours"],
  },
  name: "Vins Fins",
  description:
    "Bar à vins & restaurant au Grund, Luxembourg. Plus de 80 vins naturels et bio de vignerons artisans, accompagnés d'une cuisine française de saison.",
  url: SITE_URL,
  telephone: "+352 26 20 04 49",
  email: "info@vinsfins.lu",
  address: {
    "@type": "PostalAddress",
    streetAddress: "18 Rue Münster",
    addressLocality: "Luxembourg",
    addressRegion: "Luxembourg",
    postalCode: "L-2160",
    addressCountry: "LU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 49.60563,
    longitude: 6.13015,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "18:00",
      closes: "00:00",
    },
  ],
  priceRange: "€€€",
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
  sameAs: [
    "https://instagram.com/vins_fins_grund",
    "https://facebook.com/vins.fins.winebar",
  ],
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://bookings.zenchef.com/results?rid=371555",
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
  telephone: "+352 26 20 04 49",
  email: "info@vinsfins.lu",
  address: {
    "@type": "PostalAddress",
    streetAddress: "18 Rue Münster",
    addressLocality: "Luxembourg",
    postalCode: "L-2160",
    addressCountry: "LU",
  },
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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quels sont les horaires d'ouverture de Vins Fins ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vins Fins est ouvert du mardi au samedi de 18h00 à minuit, au 18 Rue Münster à Luxembourg-Grund. Fermé le dimanche et le lundi.",
      },
    },
    {
      "@type": "Question",
      name: "Comment réserver une table à Vins Fins ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les réservations sont recommandées et peuvent se faire en ligne via le widget Zenchef sur notre site, ou par téléphone au +352 26 20 04 49.",
      },
    },
    {
      "@type": "Question",
      name: "Combien de vins naturels avez-vous en cave ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Plus de 730 références de vins naturels, bio et biodynamiques de 18 pays, sélectionnés chez des vignerons artisans européens.",
      },
    },
    {
      "@type": "Question",
      name: "Livrez-vous du vin à l'étranger ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui — la boutique en ligne Vins Fins livre au Luxembourg, en France, en Belgique et en Allemagne. Frais de livraison 5€ en dessous de 100€ d'achat, gratuits au-delà. Retrait en boutique (Click & Collect) gratuit.",
      },
    },
    {
      "@type": "Question",
      name: "Proposez-vous des vins vegan, bio ou biodynamiques ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, la majorité de notre cave est certifiée bio ou biodynamique, avec de nombreuses cuvées vegan et sans sulfites ajoutés. Chaque fiche vin indique la certification.",
      },
    },
    {
      "@type": "Question",
      name: "Où se trouve Vins Fins au Luxembourg ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Au 18 Rue Münster, dans le quartier historique du Grund à Luxembourg-Ville (L-2160), à quelques minutes à pied de la vieille ville.",
      },
    },
  ],
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
        <Script
          id="json-ld-faq"
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className={`${playfairDisplay.variable} ${sourceSans3.variable}`}>
        <LanguageProvider>
          <DataProvider>
            <CartProvider>
              <Navigation />
              {children}
              <Footer />
              <CartSidebar />
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
