"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="relative z-[1] pt-32 pb-24 px-6 text-center">
      <h1 className="font-playfair text-3xl text-ink mb-4">Une erreur est survenue</h1>
      <p className="text-stone mb-8">Veuillez réessayer ou revenir à la page d&apos;accueil.</p>
      <button onClick={reset} className="btn-outline">
        Réessayer
      </button>
    </main>
  );
}
