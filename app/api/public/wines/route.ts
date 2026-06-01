import { NextResponse } from "next/server";
import { type Wine } from "@/data/wines";
import { getPublicWines } from "@/lib/catalogue";

// Public catalogue feed for the client (listing + detail hydration). Resolves
// through `lib/catalogue` so it stays in lock-step with the sitemap, the
// prerendered routes and the detail pages — in catalogue mode that is the
// curated static bundle; when the shop is live it is KV-first.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Strip internal fields before sending to client
function sanitizeWine(w: Wine) {
  return {
    id: w.id,
    name: w.name,
    region: w.region,
    country: w.country,
    grape: w.grape,
    category: w.category,
    section: w.section,
    description: w.description,
    priceGlass: w.priceGlass,
    priceBottle: w.priceBottle,
    priceShop: w.priceShop,
    image: w.image,
    isAvailable: w.isAvailable,
    isFeatured: w.isFeatured,
    isOrganic: w.isOrganic,
    isBiodynamic: w.isBiodynamic,
    isNatural: w.isNatural,
    // Excluded: stock, supplier, barcode
  };
}

export async function GET() {
  const allWines: Wine[] = await getPublicWines();
  return NextResponse.json(allWines.map(sanitizeWine));
}
