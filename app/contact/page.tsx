export const metadata = {
  title: "Contact & Reservation — Vins Fins | Grund, Luxembourg",
  description: "Reserve a table at Vins Fins. Find us at 18 Rue Münster, Grund, Luxembourg. View opening hours and directions.",
};

export default function ContactPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="relative z-10 text-center text-cream px-4">
          <p className="uppercase tracking-[0.2em] text-gold text-sm mb-4">Get in Touch</p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold">Contact & Reservation</h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="font-playfair text-2xl sm:text-3xl mb-8">Find Us</h2>

              <div className="space-y-6 mb-10">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-burgundy/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <span>📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-charcoal/70">18 Rue Münster<br />L-2160 Grund, Luxembourg</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-burgundy/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <span>📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <a href="tel:+352123456" className="text-burgundy hover:text-burgundy/70">+352 12 34 56</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-burgundy/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <span>✉️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:hello@vinsfins.lu" className="text-burgundy hover:text-burgundy/70">hello@vinsfins.lu</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-burgundy/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <span>🕐</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Opening Hours</h3>
                    <div className="text-charcoal/70 text-sm space-y-1">
                      <p><span className="font-semibold text-charcoal">Tuesday – Friday:</span> 12:00–14:30 & 18:30–23:00</p>
                      <p><span className="font-semibold text-charcoal">Saturday:</span> 12:00–23:00</p>
                      <p><span className="font-semibold text-charcoal">Sunday:</span> 12:00–15:00</p>
                      <p><span className="font-semibold text-charcoal">Monday:</span> Closed</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-burgundy/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <span>🅿️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Parking</h3>
                    <p className="text-charcoal/70 text-sm">
                      Street parking is available along Rue Münster. The nearest car park is
                      Parking du Grund (5 min walk). You can also take the free Grund elevator
                      from the city center (Plateau du Saint-Esprit).
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                <a href="https://instagram.com/vins_fins_grund" target="_blank" rel="noopener noreferrer" className="bg-burgundy/10 hover:bg-burgundy hover:text-cream text-burgundy w-10 h-10 rounded-sm flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://facebook.com/vins.fins.winebar" target="_blank" rel="noopener noreferrer" className="bg-burgundy/10 hover:bg-burgundy hover:text-cream text-burgundy w-10 h-10 rounded-sm flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>

            {/* Map + Reservation */}
            <div className="space-y-8">
              {/* Map */}
              <div className="aspect-video rounded-sm overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2585.8!2d6.131!3d49.6096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDM2JzM0LjYiTiA2wrAwNyc1MS42IkU!5e0!3m2!1sen!2slu!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vins Fins Location"
                />
              </div>

              {/* Reservation Widget Placeholder */}
              <div id="reservation" className="bg-white p-8 rounded-sm">
                <h2 className="font-playfair text-2xl mb-4">Reserve a Table</h2>
                <p className="text-charcoal/60 text-sm mb-6">
                  Book online via our reservation system or call us directly.
                </p>

                {/* Zenchef widget placeholder */}
                <div className="border-2 border-dashed border-burgundy/20 rounded-sm p-8 text-center bg-burgundy/5 mb-6">
                  <p className="text-burgundy font-playfair text-lg mb-2">Zenchef Reservation Widget</p>
                  <p className="text-charcoal/50 text-sm mb-4">Restaurant ID: 371555</p>
                  <p className="text-xs text-charcoal/40">
                    In production, the Zenchef booking widget would be embedded here.<br />
                    <code className="bg-charcoal/5 px-2 py-1 rounded text-xs">
                      &lt;script src=&quot;https://bookings.zenchef.com/...&quot;&gt;
                    </code>
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
                  <p className="text-xs text-charcoal/50 mt-3">
                    Or call us at <a href="tel:+352123456" className="text-burgundy">+352 12 34 56</a>
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
