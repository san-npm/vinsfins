// Canonical structured business profile. Single source of truth for
// JSON-LD, llms.txt regeneration, and any future facts pipeline.
// Anywhere a fact about the business needs to render — schema, footer,
// llms.txt, llms-full.txt, contact page — read it from here.
export const businessProfile = {
  name: 'Vins Fins',
  legalName: 'Vins Fins',
  streetAddress: '18 Rue Münster',
  postalCode: 'L-2160',
  addressLocality: 'Luxembourg',
  addressRegion: 'Luxembourg',
  addressCountry: 'LU',
  // Locality variants per language (for prose interpolation in answer engines
  // and FAQ. Maps to addressLocality + neighborhood in the active locale).
  localityByLocale: {
    fr: 'Luxembourg-Grund',
    en: 'Luxembourg-Grund',
    de: 'Luxemburg-Grund',
    lb: 'Lëtzebuerg-Gronn',
  },
  neighborhood: 'Grund',
  // Coordinates from the Google Maps embed at /contact (49°36'31.0"N 6°07'46.6"E ≈ 49.6086, 6.1296).
  // Owner: please confirm exact rooftop coords for 18 Rue Münster before relying on these for ads.
  geo: { latitude: 49.6086, longitude: 6.1296 },
  telephone: '+352 26 20 04 49',
  email: 'info@vinsfins.lu',
  priceRange: '€€',
  reservationUrl: 'https://bookings.zenchef.com/results?rid=371555',
  // Tue–Sat 18:00–00:00, closed Sun & Mon. Used by JSON-LD openingHoursSpecification.
  openingHours: [
    {
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '18:00',
      closes: '00:00',
    },
  ],
  socials: {
    instagram: 'https://instagram.com/vins_fins_grund',
    facebook: 'https://facebook.com/vins.fins.winebar',
  },
  shopUrl: 'https://www.vinsfins.lu/boutique',
  shopUrlDisplay: 'vinsfins.lu/boutique',
  mapUrl: 'https://maps.google.com/?q=18+Rue+Münster,+Luxembourg',
} as const;

export interface SiteContent {
  hours: Record<'fr' | 'en' | 'de' | 'lb', string>;
  closedMessage: Record<'fr' | 'en' | 'de' | 'lb', string>;
  heroTagline: Record<'fr' | 'en' | 'de' | 'lb', string>;
  announcement: Record<'fr' | 'en' | 'de' | 'lb', string> | null;
  address: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  zenchefId: string;
}

// Address/phone/email derive from businessProfile so the two records can't
// drift. siteContent retains its own multi-locale prose fields (hours,
// taglines, announcements) which aren't structured business facts.
const _bp = businessProfile;
export const siteContent: SiteContent = {
  hours: {
    fr: 'Mar–Sam : 18h00–00h00 | Dim–Lun : Fermé',
    en: 'Tue–Sat: 6:00 PM–12:00 AM | Sun–Mon: Closed',
    de: 'Di–Sa: 18:00–00:00 | So–Mo: Geschlossen',
    lb: 'Dë–Sa: 18:00–00:00 | So–Mo: Zou',
  },
  closedMessage: {
    fr: 'Nous sommes actuellement fermés. À bientôt !',
    en: 'We are currently closed. See you soon!',
    de: 'Wir haben derzeit geschlossen. Bis bald!',
    lb: 'Mir hunn den Ament zou. Bis geschwënn!',
  },
  heroTagline: {
    fr: 'Vins naturels & petites assiettes au cœur du Luxembourg',
    en: 'Natural wines & small plates in the heart of Luxembourg',
    de: 'Naturweine & kleine Teller im Herzen Luxemburgs',
    lb: 'Naturwäiner & kleng Telleren am Häerz vu Lëtzebuerg',
  },
  announcement: null,
  address: `${_bp.streetAddress}, ${_bp.postalCode} ${_bp.localityByLocale.fr}`,
  phone: _bp.telephone,
  email: _bp.email,
  instagram: _bp.socials.instagram,
  facebook: _bp.socials.facebook,
  zenchefId: '371555',
};
