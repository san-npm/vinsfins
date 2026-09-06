"use client";

import { useLanguage } from "@/context/LanguageContext";

const content: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
  fr: {
    title: "Conditions Générales de Vente",
    sections: [
      { heading: "1. Exploitant", body: "Vins Fins, 18 Rue Münster, L-2160 Luxembourg (Grund). Numéro d'autorisation d'établissement délivré par le Ministère de l'Économie du Grand-Duché de Luxembourg. RCS Luxembourg B178343. TVA LU26247110. Contact : info@vinsfins.lu." },
      { heading: "2. Objet", body: "Les présentes conditions régissent la vente de vins, bières, cidres et spiritueux via le site vinsfins.lu. Toute commande implique l'acceptation des présentes CGV." },
      { heading: "3. Produits", body: "Les produits proposés sont décrits avec la plus grande exactitude possible. Les photographies n'ont pas de valeur contractuelle. La vente d'alcool est interdite aux mineurs de moins de 18 ans conformément à la législation luxembourgeoise." },
      { heading: "4. Prix", body: "Les prix sont indiqués en euros, toutes taxes comprises (TVA 17% incluse). Ils sont valables au moment de la commande et susceptibles de modification sans préavis." },
      { heading: "5. Commande", body: "La commande est confirmée après validation du paiement par Stripe. Un e-mail de confirmation est envoyé à l'adresse indiquée. Vins Fins se réserve le droit de refuser une commande en cas de rupture de stock ou d'anomalie." },
      { heading: "6. Paiement", body: "Le paiement est effectué par carte bancaire via la plateforme sécurisée Stripe. Aucune donnée bancaire n'est stockée sur nos serveurs. Le montant est débité au moment de la validation de la commande." },
      { heading: "7. Livraison", body: "Livraison assurée par DPD au Luxembourg, en France, en Belgique et en Allemagne. Les frais sont calculés par colis selon la destination et affichés avant le paiement (dès 6,89 € au Luxembourg, 11,70 € en Belgique, 14,34 € en Allemagne, 19,66 € en France). Un colis contient au maximum 12 bouteilles ; au-delà, la commande est expédiée en plusieurs colis, chacun facturé séparément. Retrait en boutique (Click & Collect) gratuit. Délai de livraison estimé : 1 à 3 jours ouvrables (2 à 4 vers la France). La livraison est réservée aux personnes majeures ; le transporteur peut refuser la remise à un mineur." },
      { heading: "8. Droit de rétractation", body: "Conformément à la législation européenne, vous disposez d'un délai de 14 jours à compter de la réception pour exercer votre droit de rétractation. Les produits doivent être retournés dans leur état d'origine, non ouverts. Les frais de retour sont à la charge du client." },
      { heading: "9. Responsabilité", body: "Vins Fins ne saurait être tenu responsable des dommages résultant d'une mauvaise utilisation des produits. L'abus d'alcool est dangereux pour la santé. À consommer avec modération." },
      { heading: "10. Droit applicable", body: "Les présentes CGV sont soumises au droit luxembourgeois. Tout litige sera de la compétence des tribunaux du Grand-Duché de Luxembourg." },
    ],
  },
  en: {
    title: "Terms and Conditions of Sale",
    sections: [
      { heading: "1. Operator", body: "Vins Fins, 18 Rue Münster, L-2160 Luxembourg (Grund). Business authorization number issued by the Ministry of Economy of the Grand Duchy of Luxembourg. Luxembourg Trade and Companies Register B178343. VAT LU26247110. Contact: info@vinsfins.lu." },
      { heading: "2. Purpose", body: "These terms govern the sale of wines, beers, ciders and spirits via vinsfins.lu. Any order implies acceptance of these T&Cs." },
      { heading: "3. Products", body: "Products are described as accurately as possible. Photographs are not contractually binding. The sale of alcohol to minors under 18 is prohibited under Luxembourg law." },
      { heading: "4. Prices", body: "Prices are in euros, all taxes included (17% VAT included). They are valid at the time of order and subject to change without notice." },
      { heading: "5. Orders", body: "Orders are confirmed after payment validation via Stripe. A confirmation email is sent to the provided address. Vins Fins reserves the right to refuse an order in case of stock shortage or anomaly." },
      { heading: "6. Payment", body: "Payment is made by credit card via the secure Stripe platform. No banking data is stored on our servers. The amount is charged at the time of order validation." },
      { heading: "7. Delivery", body: "Delivery is handled by DPD to Luxembourg, France, Belgium and Germany. Charges are per parcel by destination and shown before payment (from €6.89 to Luxembourg, €11.70 to Belgium, €14.34 to Germany, €19.66 to France). A parcel holds at most 12 bottles; larger orders ship as several parcels, each charged separately. In-store pickup (Click & Collect) is free. Estimated delivery: 1-3 business days (2-4 to France). Delivery is restricted to adults; the carrier may refuse to hand a parcel to a minor." },
      { heading: "8. Right of withdrawal", body: "In accordance with European legislation, you have 14 days from receipt to exercise your right of withdrawal. Products must be returned in their original, unopened condition. Return shipping costs are borne by the customer." },
      { heading: "9. Liability", body: "Vins Fins cannot be held responsible for damages resulting from misuse of products. Alcohol abuse is dangerous for health. Drink responsibly." },
      { heading: "10. Applicable law", body: "These T&Cs are governed by Luxembourg law. Any dispute shall fall under the jurisdiction of the courts of the Grand Duchy of Luxembourg." },
    ],
  },
};

export default function CGVPage() {
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
        <p className="text-xs text-stone/50 mt-12">Dernière mise à jour / Last updated: 6 septembre 2026</p>
      </div>
    </main>
  );
}
