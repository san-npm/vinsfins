"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const STORAGE_KEY = "vf-consent-v2";

type ConsentChoice = "granted" | "denied";

function readChoice(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function writeChoice(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* storage blocked — banner will reappear next visit, acceptable */
  }
}

function applyConsent(choice: ConsentChoice) {
  const g: ("granted" | "denied") = choice === "granted" ? "granted" : "denied";
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.("consent", "update", {
    ad_storage: g,
    ad_user_data: g,
    ad_personalization: g,
    analytics_storage: g,
  });
}

export default function ConsentBanner() {
  const { t, localePath } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = readChoice();
    if (existing) {
      applyConsent(existing);
      return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  function decide(choice: ConsentChoice) {
    writeChoice(choice);
    applyConsent(choice);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label={t("consent.label")}
      className="fixed bottom-0 left-0 right-0 z-[100] bg-ink text-cream border-t border-cream/10 px-6 py-5 shadow-2xl"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
        <p className="text-sm leading-relaxed flex-1">
          {t("consent.text")}{" "}
          <a
            href={localePath("/legal/confidentialite")}
            className="underline hover:no-underline"
          >
            {t("consent.privacyLink")}
          </a>
          .
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="text-[11px] tracking-luxury uppercase px-4 py-2 border border-cream/30 hover:border-cream/60 transition-colors"
          >
            {t("consent.reject")}
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="text-[11px] tracking-luxury uppercase px-4 py-2 bg-mustard text-ink hover:bg-mustard/90 transition-colors"
          >
            {t("consent.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
