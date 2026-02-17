"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import fr from "@/data/translations/fr.json";
import en from "@/data/translations/en.json";
import de from "@/data/translations/de.json";
import lb from "@/data/translations/lb.json";

export type Locale = "fr" | "en" | "de" | "lb";

const allLocales: Locale[] = ["fr", "en", "de", "lb"];
const translations: Record<Locale, Record<string, any>> = { fr, en, de, lb };

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function detectLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split("/")[1];
  if (allLocales.includes(seg as Locale) && seg !== "fr") return seg as Locale;
  return "fr";
}

type LanguageContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  localePath: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "fr",
  setLocale: () => {},
  t: (k) => k,
  localePath: (p) => p,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Detect initial locale: URL path > cookie > default
  const [locale, setLocaleState] = useState<Locale>(() => {
    const fromPath = detectLocaleFromPath(
      typeof window !== "undefined" ? window.location.pathname : "/"
    );
    if (fromPath !== "fr") return fromPath;
    const fromCookie = typeof document !== "undefined" ? getCookie("locale") : undefined;
    if (fromCookie && allLocales.includes(fromCookie as Locale)) return fromCookie as Locale;
    return "fr";
  });

  // Sync locale when URL changes (e.g. browser back/forward)
  useEffect(() => {
    const pathLocale = detectLocaleFromPath(window.location.pathname);
    if (pathLocale !== locale) {
      setLocaleState(pathLocale);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update html lang attribute
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Language switch = navigate to locale-prefixed URL
  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale) return;
      setLocaleState(newLocale);
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`;

      // Get the "bare" path (strip current locale prefix if present)
      const realPath = window.location.pathname;
      const segments = realPath.split("/");
      const currentPrefixLocale = segments[1];
      let barePath: string;
      if (allLocales.includes(currentPrefixLocale as Locale) && currentPrefixLocale !== "fr") {
        barePath = "/" + segments.slice(2).join("/");
        if (barePath === "/") barePath = "/";
      } else {
        barePath = realPath;
      }

      // Build new URL
      const newPath = newLocale === "fr" ? barePath : `/${newLocale}${barePath}`;
      router.push(newPath);
    },
    [locale, router]
  );

  const t = useCallback(
    (key: string): string => {
      const parts = key.split(".");
      let val: any = translations[locale];
      for (const p of parts) val = val?.[p];
      if (typeof val === "string") return val;
      // fallback to French
      let fallback: any = translations.fr;
      for (const p of parts) fallback = fallback?.[p];
      return typeof fallback === "string" ? fallback : key;
    },
    [locale]
  );

  const localePath = useCallback(
    (path: string): string => {
      if (locale === "fr") return path;
      return `/${locale}${path}`;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, localePath }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
