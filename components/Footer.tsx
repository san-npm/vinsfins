"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-[1] bg-dark-light border-t border-cream/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="block">
              <Image
                src="/vinsfins-logo.png"
                alt="Vins Fins"
                width={160}
                height={160}
                className="h-16 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-4 text-sm text-stone leading-relaxed">
              Bar à Vins &amp; Restaurant
            </p>
            <p className="mt-1 text-sm text-stone leading-relaxed">
              Grund, Luxembourg
            </p>
            <p className="mt-4 text-[10px] tracking-luxury uppercase text-gold">
              Gault &amp; Millau
            </p>
          </div>

          {/* Info */}
          <div className="space-y-3 text-sm text-stone">
            <p className="text-cream font-playfair text-base mb-4">Visite</p>
            <p>18, Rue Münster</p>
            <p>L-2160 Luxembourg-Grund</p>
            <p className="mt-3">Mardi – Samedi</p>
            <p>18h – 00h</p>
          </div>

          {/* Social & press */}
          <div className="space-y-3 text-sm text-stone">
            <p className="text-cream font-playfair text-base mb-4">Suivez-nous</p>
            <a
              href="https://instagram.com/vins_fins_grund"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-cream transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
              @vins_fins_grund
            </a>
            <a
              href="https://facebook.com/vins.fins.winebar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-cream transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
              Vins Fins
            </a>
            <div className="mt-6 pt-4 border-t border-cream/5">
              <p className="text-[10px] tracking-luxury uppercase text-gold mb-2">
                Notre cave &amp; épicerie
              </p>
              <a
                href="https://lagrocerie.lu"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-cream transition-colors"
              >
                La Grocerie
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-cream/5 text-center text-[11px] text-cream/30">
          © {year} Vins Fins. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
