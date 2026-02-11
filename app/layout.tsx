import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import CookieBanner from "@/components/CookieBanner";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Vins Fins — Wine Bar & Restaurant | Grund, Luxembourg",
  description:
    "Discover exceptional wines and refined cuisine at Vins Fins, a boutique wine bar & restaurant nestled in Luxembourg's charming Grund neighborhood.",
  keywords: "wine bar, restaurant, Luxembourg, Grund, natural wine, French cuisine, wine shop",
  openGraph: {
    title: "Vins Fins — Wine Bar & Restaurant",
    description: "Exceptional wines & refined cuisine in Grund, Luxembourg",
    url: "https://vinsfins.lu",
    siteName: "Vins Fins",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Vins Fins Wine Bar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vins Fins — Wine Bar & Restaurant",
    description: "Exceptional wines & refined cuisine in Grund, Luxembourg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.setAttribute('data-theme','dark')}else{document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <ThemeProvider>
          <CartProvider>
            <Navigation />
            <CartSidebar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <CookieBanner />
          </CartProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
