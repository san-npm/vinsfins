"use client";

import { useEffect, useState } from "react";

const SHOP_ORIGIN = "https://shop.zenchef.com";
const SHOP_ID = "sh_8b6a1b26-01e6-4e41-a892-6e9e96c21375";

// The Zenchef shop UI supports fr/en/de but not lb; lb visitors get the site default.
const SHOP_LANGUAGE: Record<string, string> = { fr: "fr", en: "en", de: "de", lb: "fr" };

export function zenchefShopUrl(locale: string, mode: "embedded" | "standalone" = "embedded"): string {
  const params = new URLSearchParams({
    "shop-id": SHOP_ID,
    collections: "vouchers",
    "active-collection": "vouchers",
    language: SHOP_LANGUAGE[locale] ?? "fr",
    mode,
    "primary-color": "8b3a3a",
  });
  return `${SHOP_ORIGIN}/?${params.toString()}`;
}

export default function ZenchefShopEmbed({ locale, title }: { locale: string; title: string }) {
  const [height, setHeight] = useState(900);

  useEffect(() => {
    // The shop posts {h, id} to its parent on layout changes; that is its
    // built-in auto-resize protocol for embedded mode.
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== SHOP_ORIGIN) return;
      const h = (event.data as { h?: unknown } | null)?.h;
      if (typeof h === "number" && h >= 300 && h <= 20000) setHeight(h);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      src={zenchefShopUrl(locale)}
      title={title}
      style={{ height: `${height}px` }}
      className="w-full border-0 bg-sepia"
      allow="payment"
    />
  );
}
