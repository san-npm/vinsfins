"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-[1] bg-parchment border-t border-ink/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="font-script text-4xl text-ink">
              Vins Fins
            </Link>
            <p className="mt-4 text-sm text-stone leading-relaxed">
              Bar à Vins &amp; Restaurant
            </p>
            <p className="mt-1 text-sm text-stone leading-relaxed">
              Grund, Luxembourg
            </p>
          </div>

          {/* Info */}
          <div className="space-y-3 text-sm text-stone">
            <p className="text-ink font-playfair text-base mb-4">Visite</p>
            <p>18, Rue Münster</p>
            <p>L-2160 Luxembourg-Grund</p>
            <p className="mt-3">Mardi – Samedi</p>
            <p>18h – 00h</p>
          </div>

          {/* Social & press */}
          <div className="space-y-3 text-sm text-stone">
            <p className="text-ink font-playfair text-base mb-4">Suivez-nous</p>
            <a
              href="https://instagram.com/vins_fins_grund"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-ink transition-colors"
            >
              Instagram — @vins_fins_grund
            </a>
            <a
              href="https://facebook.com/vins.fins.winebar"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-ink transition-colors"
            >
              Facebook — Vins Fins
            </a>
            <div className="mt-6 pt-4 border-t border-ink/5">
              <p className="text-[10px] tracking-luxury uppercase text-gold">
                Gault &amp; Millau
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-ink/5 text-center text-[11px] text-stone/60">
          © {year} Vins Fins. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
