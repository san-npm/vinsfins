import Link from "next/link";

export const metadata = {
  title: "About — Vins Fins | Our Story",
  description: "Learn about Vins Fins, our philosophy of natural wines, terroir-driven selections, and the team behind the bar.",
};

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="relative z-10 text-center text-cream px-4">
          <p className="uppercase tracking-[0.2em] text-gold text-sm mb-4">Our Story</p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold">About Vins Fins</h1>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding">
        <div className="container-custom mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <p className="uppercase tracking-[0.2em] text-gold text-sm mb-4">Est. 2015</p>
              <h2 className="font-playfair text-3xl mb-6">A Passion Born in the Cellar</h2>
              <p className="text-charcoal/70 leading-relaxed mb-4">
                Vins Fins was born from a simple belief: that great wine should be accessible,
                enjoyable, and shared with warmth. Nestled in the cobblestoned streets of Luxembourg&apos;s
                Grund neighborhood, our wine bar is a sanctuary for those who appreciate the craft
                of winemaking.
              </p>
              <p className="text-charcoal/70 leading-relaxed mb-4">
                What began as a small cave à vin has grown into a beloved gathering place where
                locals and travelers alike come to discover wines that tell stories of their terroir,
                their makers, and the seasons that shaped them.
              </p>
              <p className="text-charcoal/70 leading-relaxed">
                Every bottle on our list has been personally selected, every dish on our menu
                thoughtfully crafted to enhance the wine experience. We believe dining should
                be a journey — not just a meal.
              </p>
            </div>
            <div className="aspect-[4/5] rounded-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=600&h=750&fit=crop"
                alt="Wine cellar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Philosophy */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="aspect-[4/5] rounded-sm overflow-hidden order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1560148218-1a83060f7b32?w=600&h=750&fit=crop"
                alt="Natural winemaking"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="uppercase tracking-[0.2em] text-sage text-sm mb-4">Our Philosophy</p>
              <h2 className="font-playfair text-3xl mb-6">Terroir-Driven, Naturally</h2>
              <p className="text-charcoal/70 leading-relaxed mb-4">
                We champion wines made with minimal intervention — wines that speak of place
                rather than process. Our cellar favors organic and biodynamic producers who
                work in harmony with nature.
              </p>
              <p className="text-charcoal/70 leading-relaxed mb-4">
                From the sun-drenched vineyards of Provence to the steep slopes of the
                Northern Rhône, from the chalky soils of Champagne to the volcanic terroirs
                of Beaujolais — we seek wines with soul.
              </p>
              <p className="text-charcoal/70 leading-relaxed">
                We also proudly feature Luxembourg&apos;s own Moselle wines, supporting local
                vignerons who produce world-class Rieslings, Pinot Blancs, and Crémants
                that deserve far more recognition.
              </p>
            </div>
          </div>

          {/* Team */}
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.2em] text-gold text-sm mb-4">The People</p>
            <h2 className="font-playfair text-3xl mb-4">Our Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20">
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
                <div className="aspect-[4/5] rounded-sm overflow-hidden mb-4">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-playfair text-xl mb-1">{member.name}</h3>
                <p className="text-gold text-sm font-semibold uppercase tracking-wide mb-2">{member.role}</p>
                <p className="text-charcoal/60 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: "🌿", title: "Natural & Organic", desc: "We prioritize wines made with respect for the environment and minimal intervention." },
              { icon: "🤝", title: "Community", desc: "We're more than a bar — we're a gathering place for wine lovers and friends." },
              { icon: "🌍", title: "Terroir First", desc: "Every wine tells the story of its land. We celebrate diversity of place and grape." },
            ].map((v) => (
              <div key={v.title} className="bg-white p-8 rounded-sm">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-playfair text-xl mb-3">{v.title}</h3>
                <p className="text-charcoal/60 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-burgundy section-padding text-center text-cream">
        <h2 className="font-playfair text-3xl mb-4">Come Visit Us</h2>
        <p className="text-cream/80 mb-8 max-w-xl mx-auto">
          We&apos;d love to welcome you. Book a table or simply stop by for a glass.
        </p>
        <Link href="/contact#reservation" className="btn-gold">Reserve a Table</Link>
      </section>
    </div>
  );
}
