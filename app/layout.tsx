import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { DataProvider } from "@/context/DataContext";
import Script from "next/script";

const SITE_URL = "https://vinsfins.lu";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vins Fins — Bar à Vins & Restaurant | Grund, Luxembourg",
    template: "%s | Vins Fins Luxembourg",
  },
  description:
    "Vins d'exception et cuisine raffinée au cœur du Grund. Carte des vins naturels et bio, cuisine française de saison. Réservez votre table.",
  keywords:
    "bar à vins, restaurant, Luxembourg, Grund, vin naturel, vin bio, cuisine française, cave à vins, bar à vins Luxembourg, restaurant Grund",
  authors: [{ name: "Vins Fins" }],
  creator: "Vins Fins",
  publisher: "Vins Fins",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "fr": SITE_URL,
      "en": `${SITE_URL}/en`,
      "de": `${SITE_URL}/de`,
      "lb": `${SITE_URL}/lb`,
    },
  },
  openGraph: {
    title: "Vins Fins — Bar à Vins & Restaurant | Grund, Luxembourg",
    description:
      "Vins d'exception & cuisine raffinée au Grund, Luxembourg. Plus de 80 vins naturels, cuisine française de saison.",
    url: SITE_URL,
    siteName: "Vins Fins",
    locale: "fr_FR",
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
    title: "Vins Fins — Bar à Vins & Restaurant | Grund, Luxembourg",
    description:
      "Vins d'exception & cuisine raffinée au Grund, Luxembourg",
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
    icon: "/favicon.ico",
  },
  verification: {
    // google: "YOUR_GOOGLE_VERIFICATION_CODE",
    // other: { "msvalidate.01": "YOUR_BING_VERIFICATION_CODE" },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "WineBar"],
  "@id": `${SITE_URL}/#restaurant`,
  name: "Vins Fins",
  description:
    "Bar à vins & restaurant au Grund, Luxembourg. Plus de 80 vins naturels et bio de vignerons artisans, accompagnés d'une cuisine française de saison élaborée avec les meilleurs ingrédients locaux.",
  url: SITE_URL,
  telephone: "+352-XX-XX-XX",
  email: "contact@vinsfins.lu",
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
      dayOfWeek: [
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "18:00",
      closes: "00:00",
    },
  ],
  priceRange: "€€€",
  servesCuisine: ["French", "Wine Bar"],
  acceptsReservations: true,
  menu: `${SITE_URL}/carte`,
  hasMenu: {
    "@type": "Menu",
    url: `${SITE_URL}/carte`,
  },
  image: `${SITE_URL}/og-image.jpg`,
  sameAs: [
    "https://instagram.com/vins_fins_grund",
    "https://facebook.com/vins.fins.winebar",
  ],
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://bookings.zenchef.com/results?rid=379498",
    },
    result: {
      "@type": "FoodEstablishmentReservation",
      name: "Réservation Vins Fins",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <script
          src="https://sdk.zenchef.com/v1/widget.js"
          async
          defer
        />
        <Script
          id="json-ld-restaurant"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LanguageProvider>
          <DataProvider>
            <CartProvider>
              <Navigation />
              {children}
              <Footer />
              <CartSidebar />
            </CartProvider>
          </DataProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
