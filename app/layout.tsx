import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { DataProvider } from "@/context/DataContext";

export const metadata: Metadata = {
  title: "Vins Fins — Bar à Vins & Restaurant | Grund, Luxembourg",
  description:
    "Découvrez des vins d'exception et une cuisine raffinée chez Vins Fins, bar à vins & restaurant niché dans le quartier du Grund à Luxembourg.",
  keywords: "bar à vins, restaurant, Luxembourg, Grund, vin naturel, cuisine française, cave à vins",
  openGraph: {
    title: "Vins Fins — Bar à Vins & Restaurant",
    description: "Vins d'exception & cuisine raffinée au Grund, Luxembourg",
    url: "https://vinsfins.lu",
    siteName: "Vins Fins",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Vins Fins Bar à Vins",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vins Fins — Bar à Vins & Restaurant",
    description: "Vins d'exception & cuisine raffinée au Grund, Luxembourg",
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
