import type { Locale } from "@/lib/i18n";

export type FAQItem = { question: string; answer: string };

export const faqByLocale: Record<Locale, { title: string; label: string; items: FAQItem[] }> = {
  fr: {
    label: "FAQ",
    title: "Questions Fréquentes",
    items: [
      {
        question: "Où se trouve Vins Fins ?",
        answer:
          "Vins Fins est situé au 18 Rue Münster, L-2160 Luxembourg-Grund, au cœur du quartier historique du Grund. L'ascenseur gratuit depuis le Plateau du Saint-Esprit vous amène à proximité en quelques secondes.",
      },
      {
        question: "Quels sont vos horaires d'ouverture ?",
        answer:
          "Nous ouvrons du mardi au samedi, de 18h à minuit. Fermé le dimanche et le lundi.",
      },
      {
        question: "Comment réserver une table ?",
        answer:
          "Vous pouvez réserver en ligne via notre système ZenChef sur la page Contact, ou par téléphone au +352 26 20 04 49.",
      },
      {
        question: "Servez-vous des vins naturels ?",
        answer:
          "Oui — plus de 730 références en boutique et plus de 80 vins à la carte, essentiellement naturels, biologiques et biodynamiques, chez des vignerons artisans en Loire, Bourgogne, Beaujolais, Moselle luxembourgeoise et au-delà.",
      },
      {
        question: "Livrez-vous à l'international ?",
        answer:
          "Nous livrons au Luxembourg, en France, en Allemagne et en Belgique via POST Luxembourg. Les tarifs sont calculés selon le poids au moment du paiement. Le Click & Collect à Grund est gratuit.",
      },
      {
        question: "Proposez-vous de la cuisine ?",
        answer:
          "Oui — une cuisine française de saison : entrées, planches, plats et desserts élaborés avec des produits locaux, pensés pour l'accord mets-vins.",
      },
      {
        question: "Puis-je acheter les vins en ligne ?",
        answer:
          "Oui, toute notre cave est disponible sur vinsfins.lu/boutique. Paiement sécurisé via Stripe, livraison Europe ou retrait en boutique.",
      },
    ],
  },
  en: {
    label: "FAQ",
    title: "Frequently Asked Questions",
    items: [
      {
        question: "Where is Vins Fins located?",
        answer:
          "Vins Fins is at 18 Rue Münster, L-2160 Luxembourg-Grund, in the heart of the historic Grund quarter. The free lift from Plateau du Saint-Esprit brings you nearby in seconds.",
      },
      {
        question: "What are your opening hours?",
        answer:
          "We're open Tuesday to Saturday, from 6pm to midnight. Closed Sunday and Monday.",
      },
      {
        question: "How do I book a table?",
        answer:
          "Book online via our ZenChef system on the Contact page, or call us at +352 26 20 04 49.",
      },
      {
        question: "Do you serve natural wines?",
        answer:
          "Yes — over 730 references in our shop and 80+ wines on the list, mostly natural, organic and biodynamic, from artisan winemakers in the Loire, Burgundy, Beaujolais, Luxembourg Moselle and beyond.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "We ship to Luxembourg, France, Germany and Belgium via POST Luxembourg. Rates are weight-based and shown at checkout. Click & Collect in Grund is free.",
      },
      {
        question: "Do you serve food?",
        answer:
          "Yes — seasonal French cuisine: starters, boards, mains and desserts made with local produce, designed around wine pairings.",
      },
      {
        question: "Can I buy wines online?",
        answer:
          "Yes, the full cellar is available at vinsfins.lu/boutique. Secure payment via Stripe, Europe-wide shipping or in-store pickup.",
      },
    ],
  },
  de: {
    label: "FAQ",
    title: "Häufig Gestellte Fragen",
    items: [
      {
        question: "Wo befindet sich Vins Fins?",
        answer:
          "Vins Fins liegt in der 18 Rue Münster, L-2160 Luxemburg-Grund, im Herzen des historischen Grund-Viertels. Der kostenlose Aufzug vom Plateau du Saint-Esprit bringt Sie in wenigen Sekunden in die Nähe.",
      },
      {
        question: "Was sind Ihre Öffnungszeiten?",
        answer:
          "Wir sind Dienstag bis Samstag von 18 bis 24 Uhr geöffnet. Sonntag und Montag geschlossen.",
      },
      {
        question: "Wie reserviere ich einen Tisch?",
        answer:
          "Online über unser ZenChef-System auf der Kontaktseite oder telefonisch unter +352 26 20 04 49.",
      },
      {
        question: "Servieren Sie Naturweine?",
        answer:
          "Ja — über 730 Referenzen im Shop und mehr als 80 Weine auf der Karte, überwiegend Natur-, Bio- und biodynamische Weine von handwerklichen Winzern aus Loire, Burgund, Beaujolais, Luxemburger Mosel und darüber hinaus.",
      },
      {
        question: "Liefern Sie international?",
        answer:
          "Wir liefern nach Luxemburg, Frankreich, Deutschland und Belgien via POST Luxembourg. Die Preise werden nach Gewicht beim Checkout berechnet. Click & Collect im Grund ist kostenlos.",
      },
      {
        question: "Servieren Sie Speisen?",
        answer:
          "Ja — saisonale französische Küche: Vorspeisen, Platten, Hauptgerichte und Desserts mit lokalen Produkten, abgestimmt auf die Weinbegleitung.",
      },
      {
        question: "Kann ich Weine online kaufen?",
        answer:
          "Ja, der gesamte Keller ist auf vinsfins.lu/boutique verfügbar. Sichere Zahlung via Stripe, europaweiter Versand oder Abholung im Laden.",
      },
    ],
  },
  lb: {
    label: "FAQ",
    title: "Dacks Gefrot",
    items: [
      {
        question: "Wou fënnt een Vins Fins?",
        answer:
          "Vins Fins läit op der 18 Rue Münster, L-2160 Lëtzebuerg-Gronn, am Häerz vum historeschen Gronn-Quartier. De gratis Lift vum Plateau du Saint-Esprit bréngt Iech an e puer Sekonnen an d'Géigend.",
      },
      {
        question: "Wéini sidd Dir op?",
        answer:
          "Mir sinn Dënschdeg bis Samschdeg vun 18 bis 24 Auer op. Sonndes a méindes zou.",
      },
      {
        question: "Wéi reservéieren ech en Dësch?",
        answer:
          "Online iwwer eist ZenChef-System op der Kontaktsäit oder per Telefon op +352 26 20 04 49.",
      },
      {
        question: "Hutt Dir Naturwäiner?",
        answer:
          "Jo — iwwer 730 Referenzen am Buttek a méi wéi 80 Wäiner op der Kaart, meeschtens Natur-, Bio- a biodynamesch Wäiner vu Handwierker-Wënzer aus Loire, Burgund, Beaujolais, Lëtzebuerger Musel an doriwwer eraus.",
      },
      {
        question: "Liwwert Dir international?",
        answer:
          "Mir liwweren no Lëtzebuerg, Frankräich, Däitschland a Belgien iwwer POST Luxembourg. D'Präisser ginn no Gewiicht beim Checkout gerechent. Click & Collect am Gronn ass gratis.",
      },
      {
        question: "Servéiert Dir Iesssachen?",
        answer:
          "Jo — saisonal franséisch Kichen: Virspäisen, Platen, Haaptgeriichter an Desserten mat lokale Produkter, gutt mat de Wäiner ofgestëmmt.",
      },
      {
        question: "Kann ech Wäiner online kafen?",
        answer:
          "Jo, déi ganz Keller ass op vinsfins.lu/boutique verfügbar. Sécher Bezuelung iwwer Stripe, europawäit Liwwerung oder Ofhuelung am Buttek.",
      },
    ],
  },
};
