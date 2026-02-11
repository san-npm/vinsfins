"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/wines", label: "Wines" },
  { href: "/menu", label: "Menu" },
  { href: "/shop", label: "Boutique" },
  { href: "/about", label: "Maison" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto px-4 sm:px-8 lg:px-20">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className={`font-playfair text-xl sm:text-2xl tracking-wide transition-colors duration-700 ${
              scrolled ? "text-charcoal" : "text-cream"
            }`}>
              Vins Fins
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] tracking-luxury uppercase transition-all duration-500 hover:opacity-60 ${
                  scrolled ? "text-charcoal" : "text-cream/90"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-500 hover:opacity-60 ${
                scrolled ? "text-charcoal" : "text-cream"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-burgundy text-cream text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Reserve CTA — desktop only */}
            <Link
              href="/contact#reservation"
              className={`hidden lg:inline-block text-[11px] tracking-luxury uppercase transition-all duration-500 border px-6 py-2.5 hover:opacity-70 ${
                scrolled
                  ? "border-charcoal/30 text-charcoal"
                  : "border-cream/40 text-cream"
              }`}
            >
              Réserver
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-500 ${
                scrolled ? "text-charcoal" : "text-cream"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden bg-cream/98 backdrop-blur-md pb-8 pt-4 px-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block py-4 px-2 text-charcoal text-[11px] tracking-luxury uppercase hover:opacity-50 transition-opacity duration-500"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 px-2">
              <Link
                href="/contact#reservation"
                onClick={() => setIsOpen(false)}
                className="btn-primary block text-center text-[11px]"
              >
                Réserver une Table
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
