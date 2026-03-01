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

export const siteContent: SiteContent = {
  hours: {
    fr: 'Mar–Sam : 17h00–00h00 | Dim–Lun : Fermé',
    en: 'Tue–Sat: 5:00 PM–12:00 AM | Sun–Mon: Closed',
    de: 'Di–Sa: 17:00–00:00 | So–Mo: Geschlossen',
    lb: 'Dë–Sa: 17:00–00:00 | So–Mo: Zou',
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
  address: '18 Rue Münster, L-2160 Luxembourg-Grund',
  phone: '+352 26 20 04 49',
  email: 'contact@vinsfins.lu',
  instagram: 'https://instagram.com/vins_fins_grund',
  facebook: 'https://facebook.com/vins.fins.winebar',
  zenchefId: '371555',
};
