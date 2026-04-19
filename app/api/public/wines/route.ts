import { NextResponse } from "next/server";
import { wines, type Wine } from "@/data/wines";
import { loadData } from "@/lib/storage";

// KV is the source of truth; admin edits must be visible without a redeploy.
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
  const allWines = (await loadData("wines", wines)) as Wine[];
  return NextResponse.json(allWines.map(sanitizeWine));
}
