"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage, type Locale } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

const languages: Locale[] = ["fr", "en", "de", "lb"];

const navLinks = [
  { href: "/vins", key: "nav.wines" },
  { href: "/carte", key: "nav.menu" },
  { href: "/boutique", key: "nav.shop" },
  { href: "/a-propos", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export default function Navigation() {
  const { t, locale, setLocale, localePath } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Strip locale prefix from pathname for active-link matching
  const barePath = (() => {
    const segs = pathname.split("/");
    if (["en", "de", "lb"].includes(segs[1])) {
      return "/" + segs.slice(2).join("/") || "/";
    }
    return pathname;
  })();

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
            ? "bg-dark/95 backdrop-blur-sm shadow-sm shadow-black/20"
            : "bg-dark/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <Link href={localePath("/")} className="font-script text-4xl transition-colors text-cream hover:text-gold">
            Vins Fins
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={localePath(link.href)}
                className={`text-[11px] font-light tracking-luxury uppercase transition-colors ${
                  barePath === link.href
                    ? "text-gold"
                    : "text-cream/60 hover:text-cream"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-5">
            <div className="flex items-center gap-1 text-[10px] tracking-wider text-cream/40">
              {languages.map((lang, i) => (
                <React.Fragment key={lang}>
                  <button
                    onClick={() => setLocale(lang)}
                    className={`transition-colors ${
                      locale === lang
                        ? "text-cream font-medium"
                        : "hover:text-cream"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                  {i < languages.length - 1 && <span className="text-cream/20">|</span>}
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative transition-colors text-cream/60 hover:text-cream"
              aria-label="Cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-wine text-cream text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <a
              href="https://bookings.zenchef.com/results?rid=379498"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wine text-[9px] px-6 py-2.5"
            >
              {t("nav.reserve")}
            </a>
          </div>

          <button
            className="lg:hidden p-2 text-cream"
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

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-dark flex flex-col items-center justify-center gap-8 animate-fade-in-overlay">
          <button
            className="absolute top-6 right-6 text-cream"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <Link href={localePath("/")} onClick={() => setMobileOpen(false)} className="font-script text-5xl text-cream mb-4">
            Vins Fins
          </Link>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={localePath(link.href)}
              onClick={() => setMobileOpen(false)}
              className="text-sm tracking-luxury uppercase text-cream/60 hover:text-cream transition-colors"
            >
              {t(link.key)}
            </Link>
          ))}

          <div className="flex items-center gap-2 mt-4 text-[11px] tracking-wider text-stone">
            {languages.map((lang, i) => (
              <React.Fragment key={lang}>
                <button
                  onClick={() => {
                    setLocale(lang);
                    setMobileOpen(false);
                  }}
                  className={`hover:text-cream transition-colors ${
                    locale === lang ? "text-cream font-medium" : ""
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
                {i < languages.length - 1 && <span className="text-cream/20">|</span>}
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
