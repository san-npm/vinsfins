"use client";

import { useLanguage } from "@/context/LanguageContext";

const fallback = {
  fr: { title: "Une erreur est survenue", body: "Veuillez réessayer ou revenir à la page d'accueil.", retry: "Réessayer" },
  en: { title: "Something went wrong", body: "Please try again or return to the home page.", retry: "Try again" },
  de: { title: "Etwas ist schiefgelaufen", body: "Bitte erneut versuchen oder zur Startseite zurückkehren.", retry: "Erneut versuchen" },
  lb: { title: "Et ass e Feeler geschitt", body: "Probéiert et w.e.g. nach eng Kéier oder gitt op d'Startsäit zréck.", retry: "Nach eng Kéier probéieren" },
};

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const { locale } = useLanguage();
  const copy = fallback[locale] ?? fallback.fr;

  return (
    <main className="relative z-[1] pt-32 pb-24 px-6 text-center">
      <h1 className="font-playfair text-3xl text-ink mb-4">{copy.title}</h1>
      <p className="text-stone mb-8">{copy.body}</p>
      <button onClick={reset} className="btn-outline">
        {copy.retry}
      </button>
    </main>
  );
}
