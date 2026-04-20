"use client";

import { useLanguage } from "@/context/LanguageContext";

const content: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
  fr: {
    title: "Politique de Remboursement",
    sections: [
      { heading: "1. Droit de rétractation", body: "Conformément à la directive européenne 2011/83/UE, vous disposez d'un délai de 14 jours calendaires à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités." },
      { heading: "2. Conditions de retour", body: "Les produits doivent être retournés dans leur emballage d'origine, non ouverts et en parfait état. Les bouteilles ouvertes, entamées ou endommagées par le client ne peuvent faire l'objet d'un remboursement." },
      { heading: "3. Procédure", body: "Pour initier un retour, contactez-nous à info@vinsfins.lu en indiquant votre numéro de commande. Nous vous fournirons les instructions de retour. Les frais de retour sont à la charge du client." },
      { heading: "4. Remboursement", body: "Le remboursement est effectué dans un délai de 14 jours suivant la réception des produits retournés, via le même moyen de paiement que celui utilisé pour la commande. Les frais de livraison initiaux sont remboursés." },
      { heading: "5. Produits défectueux", body: "Si vous recevez un produit défectueux (bouteille cassée, bouchonné, etc.), contactez-nous dans les 48 heures suivant la réception avec une photo. Nous procéderons au remplacement ou au remboursement sans frais." },
      { heading: "6. Click & Collect", body: "Pour les commandes retirées en boutique, vous pouvez retourner les produits directement au magasin dans les mêmes conditions (non ouverts, emballage d'origine) dans un délai de 14 jours." },
    ],
  },
  en: {
    title: "Refund Policy",
    sections: [
      { heading: "1. Right of withdrawal", body: "In accordance with EU Directive 2011/83/EU, you have 14 calendar days from receipt of your order to exercise your right of withdrawal, without having to justify reasons or pay penalties." },
      { heading: "2. Return conditions", body: "Products must be returned in their original packaging, unopened and in perfect condition. Opened, started or customer-damaged bottles cannot be refunded." },
      { heading: "3. Procedure", body: "To initiate a return, contact us at info@vinsfins.lu with your order number. We will provide return instructions. Return shipping costs are borne by the customer." },
      { heading: "4. Refund", body: "Refunds are processed within 14 days of receiving the returned products, via the same payment method used for the order. Initial delivery fees are refunded." },
      { heading: "5. Defective products", body: "If you receive a defective product (broken bottle, corked wine, etc.), contact us within 48 hours of receipt with a photo. We will replace or refund at no charge." },
      { heading: "6. Click & Collect", body: "For orders picked up in store, you can return products directly to the shop under the same conditions (unopened, original packaging) within 14 days." },
    ],
  },
};

export default function RefundPage() {
  const { locale: lang } = useLanguage();
  const c = content[lang] || content.fr;

  return (
    <main className="relative z-[1] pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-playfair text-3xl text-ink mb-10">{c.title}</h1>
        <div className="space-y-8">
          {c.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-playfair text-lg text-ink mb-2">{s.heading}</h2>
              <p className="text-sm text-stone leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-stone/50 mt-12">Dernière mise à jour / Last updated: 30 mars 2026</p>
      </div>
    </main>
  );
}
