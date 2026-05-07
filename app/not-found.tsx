import Link from "next/link";
import { getLocale, localePath } from "@/lib/i18n";

const copy = {
  fr: {
    title: "Page introuvable",
    body: "La page que vous cherchez n'existe pas ou a été déplacée.",
    home: "Retour à l'accueil",
    wines: "Voir nos vins",
  },
  en: {
    title: "Page not found",
    body: "The page you are looking for does not exist or has been moved.",
    home: "Back to home",
    wines: "Browse our wines",
  },
  de: {
    title: "Seite nicht gefunden",
    body: "Die gesuchte Seite existiert nicht oder wurde verschoben.",
    home: "Zur Startseite",
    wines: "Weine ansehen",
  },
  lb: {
    title: "Säit net fonnt",
    body: "D'Säit déi Dir sicht existéiert net oder gouf verréckelt.",
    home: "Zréck op d'Startsäit",
    wines: "Eis Wäiner kucken",
  },
} as const;

export default async function NotFound() {
  const locale = await getLocale();
  const t = copy[locale];

  return (
    <main className="relative z-[1] min-h-[60vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">404</p>
        <h1 className="font-playfair text-3xl md:text-4xl text-ink mb-4">{t.title}</h1>
        <p className="text-stone font-light mb-8">{t.body}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={localePath("/", locale)} className="btn-wine">
            {t.home}
          </Link>
          <Link href={localePath("/vins", locale)} className="btn-outline">
            {t.wines}
          </Link>
        </div>
      </div>
    </main>
  );
}
