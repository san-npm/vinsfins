export const metadata = {
  title: "Contact & Reservation — Vins Fins | Grund, Luxembourg",
  description: "Reserve a table at Vins Fins. Find us at 18 Rue Münster, Grund, Luxembourg. View opening hours and directions.",
};

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/50" />
        <div className="relative z-10 text-center text-cream px-4 sm:px-6">
          <p className="uppercase tracking-luxury text-gold/70 text-[11px] mb-4 sm:mb-6">Nous Contacter</p>
          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-7xl font-normal">Contact</h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20">
            {/* Contact Info */}
            <div>
              <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl mb-8 sm:mb-12">Find Us</h2>

              <div className="space-y-8 sm:space-y-10 mb-10 sm:mb-14">
                <div>
                  <p className="text-[11px] uppercase tracking-luxury text-gold/70 mb-3">Address</p>
                  <p className="text-charcoal/50 font-light leading-relaxed">18 Rue Münster<br />L-2160 Grund, Luxembourg</p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-luxury text-gold/70 mb-3">Phone</p>
                  <a href="tel:+352123456" className="text-charcoal/70 hover:text-charcoal transition-colors duration-500 font-light">+352 12 34 56</a>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-luxury text-gold/70 mb-3">Email</p>
                  <a href="mailto:hello@vinsfins.lu" className="text-charcoal/70 hover:text-charcoal transition-colors duration-500 font-light">hello@vinsfins.lu</a>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-luxury text-gold/70 mb-3">Hours</p>
                  <div className="text-charcoal/50 text-sm space-y-2 font-light">
                    <p>Tuesday – Friday: 12h–14h30 & 18h30–23h</p>
                    <p>Saturday: 12h–23h</p>
                    <p>Sunday: 12h–15h</p>
                    <p>Monday: Fermé</p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-luxury text-gold/70 mb-3">Getting Here</p>
                  <p className="text-charcoal/50 text-sm font-light leading-[1.9]">
                    Street parking along Rue Münster. Nearest car park: Parking du Grund (5 min walk).
                    The free Grund elevator connects from Plateau du Saint-Esprit.
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-6">
                <a href="https://instagram.com/vins_fins_grund" target="_blank" rel="noopener noreferrer" className="text-charcoal/30 hover:text-charcoal transition-colors duration-500 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://facebook.com/vins.fins.winebar" target="_blank" rel="noopener noreferrer" className="text-charcoal/30 hover:text-charcoal transition-colors duration-500 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>

            {/* Map + Reservation */}
            <div className="space-y-8 sm:space-y-10">
              {/* Map */}
              <div className="aspect-video w-[calc(100%+2rem)] -ml-4 sm:w-full sm:ml-0 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2585.8!2d6.131!3d49.6096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDM2JzM0LjYiTiA2wrAwNyc1MS42IkU!5e0!3m2!1sen!2slu!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vins Fins Location"
                  className="sm:rounded-sm"
                />
              </div>

              {/* Reservation */}
              <div id="reservation" className="border border-charcoal/5 p-6 sm:p-10 lg:p-14">
                <h2 className="font-playfair text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4">Réserver une Table</h2>
                <p className="text-charcoal/40 text-sm mb-6 sm:mb-8 font-light leading-relaxed">
                  Book online via our reservation system or call us directly.
                </p>

                <div className="border border-charcoal/5 p-6 sm:p-10 text-center bg-cream/50 mb-6 sm:mb-8">
                  <p className="font-playfair text-lg mb-2 text-charcoal/60">Zenchef Reservation</p>
                  <p className="text-charcoal/30 text-xs mb-4 font-light">Restaurant ID: 371555</p>
                  <p className="text-[11px] text-charcoal/25 font-light">
                    In production, the Zenchef booking widget would be embedded here.
                  </p>
                </div>

                <div className="text-center">
                  <a
                    href="https://bookings.zenchef.com/results?rid=371555"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-block"
                  >
                    Book on Zenchef
                  </a>
                  <p className="text-xs text-charcoal/30 mt-4 font-light">
                    Or call us at <a href="tel:+352123456" className="text-burgundy hover:opacity-60 transition-opacity duration-500">+352 12 34 56</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
