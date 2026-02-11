"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-charcoal/5">
      <div className="mx-auto px-4 sm:px-8 lg:px-20 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-10 text-center sm:text-left">
          <div>
            <h3 className="font-playfair text-lg text-charcoal mb-3">Vins Fins</h3>
            <p className="text-xs text-charcoal/60 font-light leading-relaxed">18 Rue Münster<br />Grund, Luxembourg</p>
            <p className="text-xs text-charcoal/60 font-light mt-2">+352 12 34 56</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-luxury text-charcoal/80 mb-3">{t("footer.hours")}</p>
            <p className="text-xs text-charcoal/60 font-light">{t("footer.hoursSun")}</p>
          </div>
          <div>
            <ul className="space-y-2 text-xs font-light text-charcoal/60">
              <li><Link href="/wines" className="hover:text-charcoal transition-colors duration-500">{t("footer.ourWines")}</Link></li>
              <li><Link href="/menu" className="hover:text-charcoal transition-colors duration-500">{t("footer.menu")}</Link></li>
              <li><Link href="/shop" className="hover:text-charcoal transition-colors duration-500">{t("footer.shop")}</Link></li>
              <li><Link href="/contact" className="hover:text-charcoal transition-colors duration-500">{t("footer.contact")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-charcoal/5 pt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex gap-5">
            <a href="https://instagram.com/vins_fins_grund" target="_blank" rel="noopener noreferrer" className="text-charcoal/80 hover:text-charcoal/80 transition-colors duration-500" aria-label="Instagram">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://facebook.com/vins.fins.winebar" target="_blank" rel="noopener noreferrer" className="text-charcoal/80 hover:text-charcoal/80 transition-colors duration-500" aria-label="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
          <p className="text-[10px] text-charcoal/80 tracking-wider">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
