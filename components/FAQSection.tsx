"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

export default function FAQSection({
  items,
  title = "Questions Fréquentes",
  label = "FAQ",
}: {
  items: FAQItem[];
  title?: string;
  label?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-20 md:py-24 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-luxury uppercase text-gold mb-4">
            {label}
          </p>
          <h2 className="font-playfair text-3xl md:text-4xl text-ink">
            {title}
          </h2>
        </div>
        <div className="space-y-0 divide-y divide-ink/10">
          {items.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full py-5 flex items-center justify-between text-left group"
              >
                <span className="font-playfair text-base md:text-lg text-ink pr-8">
                  {item.question}
                </span>
                <span className="text-stone/40 text-xl flex-shrink-0 transition-transform duration-300"
                  style={{ transform: openIndex === i ? "rotate(45deg)" : "none" }}
                >
                  +
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: openIndex === i ? "300px" : "0",
                  opacity: openIndex === i ? 1 : 0,
                }}
              >
                <p className="pb-5 text-sm text-stone leading-relaxed font-light">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
