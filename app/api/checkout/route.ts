import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { wines as staticWines, type Wine } from "@/data/wines";
import { reserveStock, releaseStock } from "@/lib/stock";
import { loadData } from "@/lib/storage";

interface CartItemPayload {
  wineId: string;
  quantity: number;
}

/**
 * POST Luxembourg shipping rates (2026)
 * Domestic (LU): Parcel ≤2kg = 7€, ≤10kg = 9€, ≤30kg = 22€
 * Europe Zone 1 (FR, DE, BE): Parcel ≤2kg = 12€, ≤10kg = 20€, ≤30kg = 40€
 * Average bottle weight: ~1.3kg
 */
const BOTTLE_WEIGHT_KG = 1.3;

function getShippingCents(totalBottles: number, domestic: boolean): number {
  const weightKg = totalBottles * BOTTLE_WEIGHT_KG;
  if (domestic) {
    if (weightKg <= 2) return 700;
    if (weightKg <= 10) return 900;
    return 2200; // up to 30kg
  }
  // Europe Zone 1 (FR, DE, BE)
  if (weightKg <= 2) return 1200;
  if (weightKg <= 10) return 2000;
  return 4000; // up to 30kg
}

function getShippingLabel(totalBottles: number, domestic: boolean): string {
  const cost = getShippingCents(totalBottles, domestic);
  const label = domestic ? "Livraison Luxembourg" : "Livraison Europe (FR/DE/BE)";
  return `${label} — POST Luxembourg`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, deliveryMethod } = body as {
      items: CartItemPayload[];
      deliveryMethod: "delivery" | "pickup";
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Runtime-validate deliveryMethod — reject anything other than "delivery" or "pickup"
    if (deliveryMethod !== "delivery" && deliveryMethod !== "pickup") {
      return NextResponse.json({ error: "Invalid delivery method" }, { status: 400 });
    }

    // Validate ALL items BEFORE reserving stock — prevents inventory corruption
    // via negative quantities or invalid IDs
    const wines = (await loadData("wines", staticWines)) as Wine[];

    for (const item of items) {
      if (!item.wineId || typeof item.quantity !== "number" || item.quantity < 1 || item.quantity > 99 || !Number.isInteger(item.quantity)) {
        return NextResponse.json({ error: `Invalid item: ${item.wineId}` }, { status: 400 });
      }
      const wine = wines.find((w) => w.id === item.wineId);
      if (!wine) {
        return NextResponse.json({ error: `Wine not found: ${item.wineId}` }, { status: 400 });
      }
      if (wine.priceShop <= 0) {
        return NextResponse.json({ error: `Wine not available: ${wine.name}` }, { status: 400 });
      }
    }

    // Reserve stock atomically (DECRBY in Redis — no race condition)
    const reservedItems = items.map((i) => ({ wineId: i.wineId, quantity: i.quantity }));
    const outOfStock = await reserveStock(reservedItems);
    if (outOfStock) {
      return NextResponse.json(
        { error: `Rupture de stock: ${outOfStock}` },
        { status: 400 },
      );
    }

    // From here on, stock is reserved — must release on any error
    try {
    // Build line items with server-side price truth
    const lineItems: {
      price_data: {
        currency: string;
        product_data: { name: string; description?: string };
        unit_amount: number;
      };
      quantity: number;
    }[] = [];

    let subtotal = 0;

    for (const item of items) {
      // Already validated above — safe to use directly
      const wine = wines.find((w) => w.id === item.wineId)!;
      const unitAmount = Math.round(wine.priceShop * 100); // Stripe uses cents
      subtotal += unitAmount * item.quantity;

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: wine.name,
            ...(wine.region ? { description: `${wine.region}, ${wine.country}` } : {}),
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      });
    }

    // Calculate total bottles for shipping weight
    const totalBottles = items.reduce((sum, item) => sum + item.quantity, 0);

    // Use server-side config only — never trust the Origin header for redirect URLs
    const origin = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
      || "https://vinsfins.vercel.app";

    // Build shipping options for delivery
    // Single rate (EU/Zone 1) to prevent customers selecting cheaper LU rate
    // when shipping abroad. POST Luxembourg EU rate covers all destinations.
    const shippingOptions = deliveryMethod === "delivery"
      ? [
          {
            shipping_rate_data: {
              type: "fixed_amount" as const,
              fixed_amount: { amount: getShippingCents(totalBottles, false), currency: "eur" },
              display_name: "Livraison POST Luxembourg (LU/FR/DE/BE)",
              delivery_estimate: {
                minimum: { unit: "business_day" as const, value: 1 },
                maximum: { unit: "business_day" as const, value: 7 },
              },
            },
          },
        ]
      : [
          {
            shipping_rate_data: {
              type: "fixed_amount" as const,
              fixed_amount: { amount: 0, currency: "eur" },
              display_name: "Click & Collect — Vins Fins, Grund",
            },
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_options: shippingOptions,
      shipping_address_collection: deliveryMethod === "delivery" ? {
        allowed_countries: ["LU", "FR", "DE", "BE"],
      } : undefined,
      metadata: {
        deliveryMethod,
        itemsJson: JSON.stringify(items.map((i) => ({ id: i.wineId, qty: i.quantity }))),
      },
      success_url: `${origin}/boutique/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/boutique/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
    } catch (innerErr) {
      // Stripe session creation failed — release reserved stock
      await releaseStock(reservedItems);
      console.error("Stock released after checkout failure");
      throw innerErr; // Re-throw to outer catch
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", message, err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
