"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookies-accepted");
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookies-accepted", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-charcoal text-cream p-4 sm:p-6">
      <div className="container-custom mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-cream/80 text-center sm:text-left">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button onClick={accept} className="btn-gold text-xs py-2 px-6">Accept</button>
          <button onClick={accept} className="text-cream/60 hover:text-cream text-xs font-semibold uppercase tracking-wide">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
