import Image from "next/image";
import { WINE_IMAGES_ENABLED } from "@/lib/flags";

/**
 * Wine product image with its aspect-ratio box.
 *
 * While WINE_IMAGES_ENABLED is false (catalogue mode, awaiting real
 * photography) this renders NOTHING, so wine cards and detail pages fall back
 * to a clean text-only layout. Flip the flag to bring the photo back exactly
 * as before — call sites don't change.
 *
 * `children` (e.g. certification badge overlays) only render alongside the
 * image; in text-only mode use <WineBadges> to surface them inline instead.
 */
export default function WineImage({
  src,
  alt,
  wrapperClassName,
  imageClassName,
  sizes,
  priority,
  children,
}: {
  src: string;
  alt: string;
  wrapperClassName?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  if (!WINE_IMAGES_ENABLED) return null;

  return (
    <div className={wrapperClassName ?? "relative aspect-[3/4] overflow-hidden mb-4 bg-parchment"}>
      <Image
        unoptimized
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={imageClassName ?? "object-cover transition-transform duration-700 group-hover:scale-105"}
      />
      {children}
    </div>
  );
}
