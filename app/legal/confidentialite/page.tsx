"use client";

import { useLanguage } from "@/context/LanguageContext";

const content: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
  fr: {
    title: "Politique de Confidentialité",
    sections: [
      { heading: "1. Responsable du traitement", body: "Vins Fins, 18 Rue Münster, L-2160 Luxembourg. Contact : contact@vinsfins.lu." },
      { heading: "2. Données collectées", body: "Lors d'une commande : nom, adresse e-mail, adresse de livraison, numéro de téléphone (optionnel). Les données de paiement sont traitées exclusivement par Stripe et ne sont jamais stockées sur nos serveurs." },
      { heading: "3. Finalité du traitement", body: "Vos données sont utilisées pour : traiter et livrer votre commande, vous envoyer la confirmation de commande, vous contacter en cas de problème avec votre commande, respecter nos obligations légales." },
      { heading: "4. Base légale", body: "Le traitement est fondé sur l'exécution du contrat (votre commande) et nos obligations légales (facturation, lutte contre la vente d'alcool aux mineurs)." },
      { heading: "5. Durée de conservation", body: "Les données de commande sont conservées pendant la durée légale de conservation comptable (10 ans au Luxembourg). Les données de contact sont supprimées sur simple demande." },
      { heading: "6. Sous-traitants", body: "Stripe (paiement), Vercel (hébergement), Resend (e-mails transactionnels). Ces prestataires sont conformes au RGPD." },
      { heading: "7. Vos droits", body: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression, de limitation et de portabilité de vos données. Pour exercer ces droits : contact@vinsfins.lu." },
      { heading: "8. Cookies", body: "Le site utilise uniquement des cookies techniques nécessaires au fonctionnement (panier, préférence de langue). Aucun cookie de tracking ou publicitaire n'est utilisé." },
      { heading: "9. Sécurité", body: "Les communications sont chiffrées (HTTPS). Les paiements sont sécurisés par Stripe (PCI DSS Level 1). Aucune donnée bancaire ne transite par nos serveurs." },
    ],
  },
  en: {
    title: "Privacy Policy",
    sections: [
      { heading: "1. Data controller", body: "Vins Fins, 18 Rue Münster, L-2160 Luxembourg. Contact: contact@vinsfins.lu." },
      { heading: "2. Data collected", body: "When placing an order: name, email address, delivery address, phone number (optional). Payment data is processed exclusively by Stripe and is never stored on our servers." },
      { heading: "3. Purpose of processing", body: "Your data is used to: process and deliver your order, send order confirmation, contact you in case of issues with your order, comply with legal obligations." },
      { heading: "4. Legal basis", body: "Processing is based on contract performance (your order) and legal obligations (invoicing, prevention of alcohol sales to minors)." },
      { heading: "5. Retention period", body: "Order data is kept for the legal accounting retention period (10 years in Luxembourg). Contact data is deleted upon request." },
      { heading: "6. Subprocessors", body: "Stripe (payments), Vercel (hosting), Resend (transactional emails). These providers are GDPR compliant." },
      { heading: "7. Your rights", body: "Under GDPR, you have the right to access, rectify, delete, restrict and port your data. To exercise these rights: contact@vinsfins.lu." },
      { heading: "8. Cookies", body: "The site only uses technical cookies necessary for operation (cart, language preference). No tracking or advertising cookies are used." },
      { heading: "9. Security", body: "Communications are encrypted (HTTPS). Payments are secured by Stripe (PCI DSS Level 1). No banking data passes through our servers." },
    ],
  },
};

export default function PrivacyPage() {
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
