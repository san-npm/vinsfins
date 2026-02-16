"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

const languages = ["FR", "EN", "DE", "LB"] as const;

const navLinks = [
  { href: "/vins", key: "nav.wines" },
  { href: "/carte", key: "nav.menu" },
  { href: "/boutique", key: "nav.shop" },
  { href: "/a-propos", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export default function Navigation() {
  const { t, locale, setLocale } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasHero = pathname === "/";
  const isLight = scrolled || !hasHero;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-sepia/95 backdrop-blur-sm shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className={`font-script text-4xl transition-colors ${isLight ? "text-ink hover:text-wine" : "text-white hover:text-white/80"}`}>
            Vins Fins
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] font-light tracking-luxury uppercase transition-colors ${isLight ? "text-ink/70 hover:text-ink" : "text-white/70 hover:text-white"}`}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Language switcher */}
            <div className={`flex items-center gap-1 text-[10px] tracking-wider ${isLight ? "text-stone" : "text-white/50"}`}>
              {languages.map((lang, i) => (
                <React.Fragment key={lang}>
                  <button
                    onClick={() => setLocale(lang.toLowerCase() as "fr" | "en" | "de" | "lb")}
                    className={`transition-colors ${
                      locale === lang.toLowerCase() 
                        ? isLight ? "text-ink font-medium" : "text-white font-medium"
                        : isLight ? "hover:text-ink" : "hover:text-white"
                    }`}
                  >
                    {lang}
                  </button>
                  {i < languages.length - 1 && <span className={isLight ? "text-stone/40" : "text-white/20"}>|</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative transition-colors ${isLight ? "text-ink/70 hover:text-ink" : "text-white/70 hover:text-white"}`}
              aria-label="Cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-wine text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Reserve */}
            <a
              href="https://bookings.zenchef.com/results?rid=379498"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wine text-[9px] px-6 py-2.5"
            >
              {t("nav.reserve")}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`lg:hidden p-2 ${isLight ? "text-ink" : "text-white"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-sepia flex flex-col items-center justify-center gap-8 animate-fade-in-overlay">
          <button
            className="absolute top-6 right-6 text-ink"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <Link href="/" onClick={() => setMobileOpen(false)} className="font-script text-5xl text-ink mb-4">
            Vins Fins
          </Link>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm tracking-luxury uppercase text-ink/70 hover:text-ink transition-colors"
            >
              {t(link.key)}
            </Link>
          ))}

          <div className="flex items-center gap-2 mt-4 text-[11px] tracking-wider text-stone">
            {languages.map((lang, i) => (
              <React.Fragment key={lang}>
                <button
                  onClick={() => {
                    setLocale(lang.toLowerCase() as "fr" | "en" | "de" | "lb");
                    setMobileOpen(false);
                  }}
                  className={`hover:text-ink transition-colors ${
                    locale === lang.toLowerCase() ? "text-ink font-medium" : ""
                  }`}
                >
                  {lang}
                </button>
                {i < languages.length - 1 && <span className="text-stone/40">|</span>}
              </React.Fragment>
            ))}
          </div>

          <a
            href="https://bookings.zenchef.com/results?rid=379498"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wine mt-4"
            onClick={() => setMobileOpen(false)}
          >
            {t("nav.reserve")}
          </a>
        </div>
      )}
    </>
  );
}
