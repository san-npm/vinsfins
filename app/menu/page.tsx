import { menuSections, seasonalSpecials } from "@/data/menu";

export const metadata = {
  title: "Menu — Vins Fins | Grund, Luxembourg",
  description: "Seasonal French-inspired cuisine with wine pairing suggestions at Vins Fins.",
};

export default function MenuPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=600&fit=crop')" }} />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="relative z-10 text-center text-cream px-4">
          <p className="uppercase tracking-[0.2em] text-gold text-sm mb-4">Seasonal & Inspired</p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold">Our Menu</h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom mx-auto max-w-4xl">
          {/* Seasonal Specials */}
          <div className="mb-20 bg-burgundy/5 border border-burgundy/10 rounded-sm p-8 sm:p-12">
            <div className="text-center mb-8">
              <span className="text-sage text-sm uppercase tracking-[0.2em] font-semibold">✦ Limited Time ✦</span>
              <h2 className="font-playfair text-2xl sm:text-3xl mt-2">{seasonalSpecials.title}</h2>
              <p className="text-charcoal/60 mt-2">{seasonalSpecials.description}</p>
            </div>
            <div className="space-y-6">
              {seasonalSpecials.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-playfair text-lg font-semibold text-burgundy">{item.name}</h4>
                    <p className="text-sm text-charcoal/60 mt-1">{item.description}</p>
                  </div>
                  <span className="text-burgundy font-semibold whitespace-nowrap">€{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Sections */}
          {menuSections.map((section) => (
            <div key={section.title} className="mb-16">
              <div className="text-center mb-10">
                <h2 className="font-playfair text-2xl sm:text-3xl">{section.title}</h2>
                <div className="w-16 h-px bg-gold mx-auto mt-4" />
              </div>
              <div className="space-y-8">
                {section.items.map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-playfair text-lg font-semibold">{item.name}</h4>
                          {item.isSpecial && (
                            <span className="text-xs bg-sage/20 text-sage px-2 py-0.5 rounded-full font-semibold uppercase">
                              Special
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-charcoal/60 mt-1">{item.description}</p>
                        {item.winePairing && (
                          <p className="text-xs text-burgundy/70 mt-2 italic">
                            🍷 Pair with: {item.winePairing}
                          </p>
                        )}
                      </div>
                      <span className="text-burgundy font-bold text-lg whitespace-nowrap">€{item.price}</span>
                    </div>
                    <div className="border-b border-charcoal/5 mt-6" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center bg-white p-8 rounded-sm">
            <p className="text-charcoal/60 text-sm">
              All prices include VAT. Please inform us of any allergies or dietary requirements.
              <br />
              Our team is happy to suggest wine pairings for every dish.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
