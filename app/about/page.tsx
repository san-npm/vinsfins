import Link from "next/link";

export const metadata = {
  title: "About — Vins Fins | Our Story",
  description: "Learn about Vins Fins, our philosophy of natural wines, terroir-driven selections, and the team behind the bar.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/50" />
        <div className="relative z-10 text-center text-cream px-4 sm:px-6">
          <p className="uppercase tracking-luxury text-gold/70 text-[11px] mb-4 sm:mb-6">Notre Histoire</p>
          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-7xl font-normal">La Maison</h1>
        </div>
      </section>

      {/* Story — Editorial layout */}
      <section className="px-4 sm:px-8 lg:px-20 py-16 sm:py-24 lg:py-36">
        <div className="max-w-7xl mx-auto">
          {/* First block — text left, image right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16 sm:mb-24 lg:mb-32">
            <div className="lg:col-span-5 lg:pr-8">
              <p className="uppercase tracking-luxury text-gold text-[11px] mb-4 sm:mb-6">Est. 2015</p>
              <h2 className="font-playfair text-2xl sm:text-3xl lg:text-5xl mb-6 sm:mb-8 leading-tight">A Passion Born in the Cellar</h2>
              <p className="text-charcoal/45 leading-[1.9] mb-5 font-light text-sm sm:text-base">
                Vins Fins was born from a simple belief: that great wine should be accessible,
                enjoyable, and shared with warmth. Nestled in the cobblestoned streets of Luxembourg&apos;s
                Grund neighborhood, our wine bar is a sanctuary for those who appreciate the craft
                of winemaking.
              </p>
              <p className="text-charcoal/45 leading-[1.9] mb-5 font-light text-sm sm:text-base">
                What began as a small cave à vin has grown into a beloved gathering place where
                locals and travelers alike come to discover wines that tell stories of their terroir,
                their makers, and the seasons that shaped them.
              </p>
              <p className="text-charcoal/45 leading-[1.9] font-light text-sm sm:text-base">
                Every bottle on our list has been personally selected, every dish on our menu
                thoughtfully crafted to enhance the wine experience. We believe dining should
                be a journey — not just a meal.
              </p>
            </div>
            <div className="lg:col-span-7 lg:pl-12">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=600&h=750&fit=crop"
                  alt="Wine cellar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Philosophy — image left, text right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16 sm:mb-24 lg:mb-32">
            <div className="lg:col-span-7 lg:pr-12 order-2 lg:order-1">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560148218-1a83060f7b32?w=600&h=750&fit=crop"
                  alt="Natural winemaking"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2">
              <p className="uppercase tracking-luxury text-sage text-[11px] mb-4 sm:mb-6">Notre Philosophie</p>
              <h2 className="font-playfair text-2xl sm:text-3xl lg:text-5xl mb-6 sm:mb-8 leading-tight">Terroir-Driven, Naturally</h2>
              <p className="text-charcoal/45 leading-[1.9] mb-5 font-light text-sm sm:text-base">
                We champion wines made with minimal intervention — wines that speak of place
                rather than process. Our cellar favors organic and biodynamic producers who
                work in harmony with nature.
              </p>
              <p className="text-charcoal/45 leading-[1.9] mb-5 font-light text-sm sm:text-base">
                From the sun-drenched vineyards of Provence to the steep slopes of the
                Northern Rhône, from the chalky soils of Champagne to the volcanic terroirs
                of Beaujolais — we seek wines with soul.
              </p>
              <p className="text-charcoal/45 leading-[1.9] font-light text-sm sm:text-base">
                We also proudly feature Luxembourg&apos;s own Moselle wines, supporting local
                vignerons who produce world-class Rieslings, Pinot Blancs, and Crémants
                that deserve far more recognition.
              </p>
            </div>
          </div>

          {/* Team */}
          <div className="text-center mb-10 sm:mb-16">
            <p className="uppercase tracking-luxury text-gold text-[11px] mb-4 sm:mb-6">L&apos;Équipe</p>
            <h2 className="font-playfair text-2xl sm:text-3xl lg:text-5xl">Our Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-12 mb-16 sm:mb-24 lg:mb-32">
            {[
              {
                name: "Marc Duval",
                role: "Founder & Sommelier",
                bio: "Former head sommelier at a Michelin-starred restaurant in Paris, Marc brought his passion for natural wines to Luxembourg.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
              },
              {
                name: "Sophie Laurent",
                role: "Head Chef",
                bio: "Classically trained in Lyon, Sophie creates seasonal menus that celebrate local produce and complement our wine selection.",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
              },
              {
                name: "Thomas Weber",
                role: "Wine Buyer & Manager",
                bio: "With deep roots in Luxembourg's wine scene, Thomas travels the vineyards of Europe to source our finest bottles.",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
              },
            ].map((member) => (
              <div key={member.name} className="text-center">
                <div className="aspect-[4/5] overflow-hidden mb-4 sm:mb-6">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-playfair text-lg sm:text-xl mb-2">{member.name}</h3>
                <p className="text-[11px] uppercase tracking-luxury text-gold/70 mb-3 sm:mb-4">{member.role}</p>
                <p className="text-charcoal/40 text-sm font-light leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-charcoal/5">
            {[
              { title: "Natural & Organic", desc: "We prioritize wines made with respect for the environment and minimal intervention." },
              { title: "Community", desc: "We're more than a bar — we're a gathering place for wine lovers and friends." },
              { title: "Terroir First", desc: "Every wine tells the story of its land. We celebrate diversity of place and grape." },
            ].map((v) => (
              <div key={v.title} className="bg-cream p-8 sm:p-12 lg:p-16 text-center">
                <h3 className="font-playfair text-lg sm:text-xl mb-3 sm:mb-4">{v.title}</h3>
                <p className="text-charcoal/40 text-sm font-light leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-charcoal" />
        <div className="relative z-10 text-center text-cream px-4 sm:px-6">
          <h2 className="font-playfair text-2xl sm:text-3xl lg:text-5xl mb-4 sm:mb-6">Come Visit Us</h2>
          <p className="text-cream/35 mb-8 sm:mb-12 max-w-md mx-auto font-light leading-relaxed text-sm sm:text-base">
            We&apos;d love to welcome you. Book a table or simply stop by for a glass.
          </p>
          <Link href="/contact#reservation" className="border border-cream/30 text-cream px-10 sm:px-14 py-4 text-[11px] tracking-luxury uppercase hover:bg-cream hover:text-charcoal transition-all duration-700 inline-block">
            Réserver une Table
          </Link>
        </div>
      </section>
    </div>
  );
}
