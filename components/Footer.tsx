"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-charcoal text-cream/50">
      <div className="mx-auto px-4 sm:px-8 lg:px-20 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 mb-16 sm:mb-20 text-center sm:text-left">
          {/* Brand */}
          <div>
            <h3 className="font-playfair text-3xl text-cream mb-6 font-normal">Vins Fins</h3>
            <p className="text-sm leading-[1.9] font-light">
              Bar à vins & restaurant in the heart of Luxembourg&apos;s historic Grund
              neighborhood. Curated wines, inspired cuisine, unforgettable moments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] uppercase tracking-luxury text-cream/30 mb-6 sm:mb-8">Explore</h4>
            <ul className="space-y-4 text-sm font-light">
              <li><Link href="/wines" className="hover:text-cream transition-colors duration-500">Our Wines</Link></li>
              <li><Link href="/menu" className="hover:text-cream transition-colors duration-500">Menu</Link></li>
              <li><Link href="/shop" className="hover:text-cream transition-colors duration-500">Boutique</Link></li>
              <li><Link href="/about" className="hover:text-cream transition-colors duration-500">Maison</Link></li>
              <li><Link href="/contact" className="hover:text-cream transition-colors duration-500">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[11px] uppercase tracking-luxury text-cream/30 mb-6 sm:mb-8">Visit</h4>
            <ul className="space-y-4 text-sm font-light">
              <li>18 Rue Münster</li>
              <li>Grund, Luxembourg</li>
              <li className="pt-2">
                <a href="tel:+352123456" className="hover:text-cream transition-colors duration-500">+352 12 34 56</a>
              </li>
              <li>
                <a href="mailto:hello@vinsfins.lu" className="hover:text-cream transition-colors duration-500">hello@vinsfins.lu</a>
              </li>
              <li className="pt-2 leading-[1.9]">
                Tue–Sat: 12h–14h30, 18h30–23h<br />
                Sun: 12h–15h · Mon: Fermé
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] uppercase tracking-luxury text-cream/30 mb-6 sm:mb-8">Newsletter</h4>
            <p className="text-sm mb-6 font-light leading-[1.9]">
              Wine events, new arrivals, and exclusive offers.
            </p>
            {subscribed ? (
              <p className="text-gold text-sm font-light">Merci. À bientôt.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="w-full bg-transparent border-b border-cream/15 px-0 py-3 text-sm text-cream placeholder:text-cream/20 focus:outline-none focus:border-gold/50 focus:ring-0 transition-colors duration-500 appearance-none rounded-none"
                />
                <button type="submit" className="text-[11px] uppercase tracking-luxury text-cream/40 hover:text-cream border-b border-cream/15 pb-1 transition-colors duration-500 min-h-[44px] inline-flex items-center">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Social + Bottom */}
        <div className="border-t border-cream/8 pt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex gap-8 sm:gap-6">
            <a href="https://instagram.com/vins_fins_grund" target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors duration-500 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Instagram">
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://facebook.com/vins.fins.winebar" target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors duration-500 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Facebook">
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.tripadvisor.com/Restaurant_Review-Luxembourg" target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors duration-500 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="TripAdvisor">
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            </a>
          </div>
          <p className="text-[11px] text-cream/25 tracking-wider">© 2026 Vins Fins. All rights reserved.</p>
          <div className="flex gap-8 text-[11px] text-cream/25 tracking-wide">
            <a href="#" className="hover:text-cream/50 transition-colors duration-500">Privacy</a>
            <a href="#" className="hover:text-cream/50 transition-colors duration-500">Terms</a>
            <a href="#" className="hover:text-cream/50 transition-colors duration-500">Imprint</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
