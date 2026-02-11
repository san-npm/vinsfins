"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useLanguage, Locale } from "@/context/LanguageContext";

const heroPages = ["/", "/wines", "/shop", "/about", "/contact", "/menu"];
const locales: Locale[] = ["fr", "en", "de", "lb"];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { locale, setLocale, t } = useLanguage();
  const hasHero = heroPages.includes(pathname);
  const isLight = scrolled || !hasHero;

  const navLinks = [
    { href: "/wines", label: t("nav.wines") },
    { href: "/menu", label: t("nav.menu") },
    { href: "/shop", label: t("nav.shop") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const LanguageSwitcher = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-1 ${className}`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          <button
            onClick={() => setLocale(l)}
            className={`text-[10px] tracking-wider uppercase transition-all duration-300 px-1 py-0.5 ${
              locale === l
                ? isLight ? "text-charcoal font-semibold" : "text-cream font-semibold"
                : isLight ? "text-charcoal/80 hover:text-charcoal/80" : "text-cream/25 hover:text-cream/50"
            }`}
          >
            {l.toUpperCase()}
          </button>
          {i < locales.length - 1 && (
            <span className={`text-[10px] ${isLight ? "text-charcoal/70" : "text-cream/10"}`}>|</span>
          )}
        </span>
      ))}
    </div>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isLight ? "bg-cream/95 backdrop-blur-md" : "bg-transparent"}`}>
      <div className="mx-auto px-4 sm:px-8 lg:px-20">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center">
            <span className={`font-playfair text-lg sm:text-xl tracking-wide transition-colors duration-700 ${isLight ? "text-charcoal" : "text-cream"}`}>Vins Fins</span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`text-[10px] tracking-luxury uppercase transition-all duration-500 hover:opacity-50 ${isLight ? "text-charcoal/60" : "text-cream/60"}`}>{link.label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            <div className="hidden lg:block"><LanguageSwitcher /></div>

            <button onClick={() => setIsCartOpen(true)} className={`relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-500 hover:opacity-50 ${isLight ? "text-charcoal" : "text-cream"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-burgundy text-cream text-[9px] w-4 h-4 flex items-center justify-center">{totalItems}</span>
              )}
            </button>

            <Link href="/contact#reservation" className={`hidden lg:inline-block text-[10px] tracking-luxury uppercase transition-all duration-500 hover:opacity-50 ${isLight ? "text-charcoal/80" : "text-cream/50"}`}>{t("nav.reserve")}</Link>

            <button onClick={() => setIsOpen(!isOpen)} className={`lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-500 ${isLight ? "text-charcoal" : "text-cream"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden fixed inset-0 top-0 left-0 w-full h-full bg-cream z-50 flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 sm:px-8">
              <Link href="/" onClick={() => setIsOpen(false)} className="font-playfair text-lg tracking-wide text-charcoal">Vins Fins</Link>
              <button onClick={() => setIsOpen(false)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-8 pt-2 pb-4">
              <div className="flex items-center gap-1 justify-center">
                {locales.map((l, i) => (
                  <span key={l} className="flex items-center">
                    <button onClick={() => setLocale(l)} className={`text-[11px] tracking-wider uppercase transition-all duration-300 px-1.5 py-1 ${locale === l ? "text-charcoal font-semibold" : "text-charcoal/80 hover:text-charcoal/80"}`}>{l.toUpperCase()}</button>
                    {i < locales.length - 1 && <span className="text-[10px] text-charcoal/70">|</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center px-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="block py-4 text-charcoal font-playfair text-xl hover:opacity-40 transition-opacity duration-500">{link.label}</Link>
              ))}
            </div>
            <div className="px-8 pb-12">
              <Link href="/contact#reservation" onClick={() => setIsOpen(false)} className="block text-center text-[11px] tracking-luxury uppercase text-charcoal/70">{t("nav.reserveTable")}</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
