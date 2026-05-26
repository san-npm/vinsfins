import { WINE_IMAGES_ENABLED } from "@/lib/flags";

type Certifications = {
  isNatural?: boolean;
  isOrganic?: boolean;
  isBiodynamic?: boolean;
};

/**
 * Inline certification chips (Naturel / Bio / Biodynamie) for catalogue mode.
 *
 * Renders only while WINE_IMAGES_ENABLED is false — when photos return, the
 * on-image overlay badges already cover this, so this component yields null to
 * avoid duplicate chips.
 */
export default function WineBadges({
  wine,
  className,
}: {
  wine: Certifications;
  className?: string;
}) {
  if (WINE_IMAGES_ENABLED) return null;

  const chips: string[] = [];
  if (wine.isNatural) chips.push("Naturel");
  if (wine.isOrganic) chips.push("Bio");
  if (wine.isBiodynamic) chips.push("Biodynamie");
  if (chips.length === 0) return null;

  return (
    <div className={className ?? "flex flex-wrap gap-1.5 mb-2"}>
      {chips.map((c) => (
        <span
          key={c}
          className="text-[8px] tracking-luxury uppercase px-2 py-0.5 border border-ink/15 text-stone"
        >
          {c}
        </span>
      ))}
    </div>
  );
}
