import Link from "next/link";
import { featuredWines } from "@/data/wines";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1920&h=1080&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-charcoal/50" />
        <div className="relative z-10 text-center text-cream px-4 max-w-4xl">
          <p className="uppercase tracking-[0.3em] text-gold text-sm mb-6">
            Wine Bar & Restaurant · Grund, Luxembourg
          </p>
          <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Vins Fins
          </h1>
          <p className="text-lg sm:text-xl text-cream/80 mb-10 max-w-2xl mx-auto font-light">
            A curated selection of exceptional wines paired with refined cuisine,
            in the heart of Luxembourg&apos;s most charming neighborhood.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact#reservation" className="btn-primary bg-burgundy text-lg px-10 py-4">
              Reserve a Table
            </Link>
            <Link href="/wines" className="btn-outline border-cream text-cream hover:bg-cream hover:text-charcoal text-lg px-10 py-4">
              Explore Our Wines
            </Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-cream/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Introduction */}
      <section className="section-padding">
        <div className="container-custom mx-auto text-center max-w-3xl">
          <p className="uppercase tracking-[0.2em] text-gold text-sm mb-4">Welcome</p>
          <h2 className="font-playfair text-3xl sm:text-4xl mb-6">Where Wine Tells a Story</h2>
          <p className="text-charcoal/70 leading-relaxed text-lg">
            Nestled along the Alzette River in Luxembourg&apos;s historic Grund quarter,
            Vins Fins is a haven for wine lovers. Our carefully curated cellar celebrates
            terroir-driven wines from passionate artisan producers, complemented by
            seasonal cuisine crafted with the finest local ingredients.
          </p>
        </div>
      </section>

      {/* Featured Wines */}
      <section className="section-padding bg-white">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.2em] text-gold text-sm mb-4">From Our Cellar</p>
            <h2 className="font-playfair text-3xl sm:text-4xl mb-4">Featured Wines</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredWines.slice(0, 6).map((wine) => (
              <div key={wine.id} className="wine-card bg-cream rounded-sm overflow-hidden group">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={wine.image}
                    alt={wine.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-wider text-gold mb-2">{wine.region}</p>
                  <h3 className="font-playfair text-xl mb-2">{wine.name}</h3>
                  <p className="text-sm text-charcoal/60 mb-3">{wine.grape} · {wine.vintage}</p>
                  <p className="text-sm text-charcoal/70 mb-4 line-clamp-2">{wine.tastingNotes}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-burgundy font-semibold">€{wine.priceGlass} / glass</span>
                    <span className="text-charcoal/50 text-sm">€{wine.priceBottle} / bottle</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/wines" className="btn-outline">
              View Full Wine List
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Info Sections */}
      <section className="section-padding">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Preview */}
            <div className="bg-white p-8 rounded-sm text-center">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="font-playfair text-xl mb-3">Our Menu</h3>
              <p className="text-charcoal/70 text-sm mb-6">
                Seasonal French-inspired cuisine designed to complement our wines perfectly.
              </p>
              <Link href="/menu" className="text-burgundy font-semibold text-sm uppercase tracking-wide hover:text-burgundy/70 transition-colors">
                View Menu →
              </Link>
            </div>

            {/* E-Shop */}
            <div className="bg-burgundy p-8 rounded-sm text-center text-cream">
              <div className="text-4xl mb-4">🍷</div>
              <h3 className="font-playfair text-xl mb-3">Shop Online</h3>
              <p className="text-cream/80 text-sm mb-6">
                Take the experience home. Browse our selection of wines available for delivery.
              </p>
              <Link href="/shop" className="text-gold font-semibold text-sm uppercase tracking-wide hover:text-gold/70 transition-colors">
                Visit E-Shop →
              </Link>
            </div>

            {/* Events */}
            <div className="bg-white p-8 rounded-sm text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-playfair text-xl mb-3">Visit Us</h3>
              <p className="text-charcoal/70 text-sm mb-2">18 Rue Münster, Grund</p>
              <p className="text-charcoal/70 text-sm mb-2">Tue–Sat: 12:00–14:30 & 18:30–23:00</p>
              <p className="text-charcoal/70 text-sm mb-6">Sun: 12:00–15:00</p>
              <Link href="/contact" className="text-burgundy font-semibold text-sm uppercase tracking-wide hover:text-burgundy/70 transition-colors">
                Get Directions →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=600&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="relative z-10 text-center text-cream px-4">
          <h2 className="font-playfair text-3xl sm:text-4xl mb-4">Ready for an Unforgettable Evening?</h2>
          <p className="text-cream/80 mb-8 max-w-xl mx-auto">
            Reserve your table and let us craft a memorable wine and dining experience for you.
          </p>
          <Link href="/contact#reservation" className="btn-primary text-lg px-10 py-4">
            Reserve a Table
          </Link>
        </div>
      </section>
    </>
  );
}
