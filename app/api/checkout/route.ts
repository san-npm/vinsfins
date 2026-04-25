import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { getStripe } from "@/lib/stripe";
import { wines as staticWines, type Wine } from "@/data/wines";
import { reserveStock, releaseStock } from "@/lib/stock";
import { loadData } from "@/lib/storage";
import { getClientIp, rateLimit } from "@/lib/ratelimit";

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

// Checkout Session expiry — Stripe minimum is 30 minutes.
// Short expiry releases reserved stock quickly if the customer abandons.
const CHECKOUT_EXPIRY_SECONDS = 30 * 60;

// Rate limits: protects against stock-reservation abuse.
const RL_PER_MINUTE = 8;
const RL_PER_HOUR = 30;

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

export async function POST(req: NextRequest) {
  // Per-IP rate limit before any mutation. `failClosed: true` means a KV
  // outage returns 503 rather than silently disabling the limiter and
  // re-exposing the stock-reservation abuse this control was added to stop.
  const ip = getClientIp(req);
  const minuteCheck = await rateLimit(`checkout:ip:${ip}:m`, RL_PER_MINUTE, 60, { failClosed: true });
  if (!minuteCheck.ok) {
    const status = minuteCheck.unavailable ? 503 : 429;
    return NextResponse.json(
      {
        error: minuteCheck.unavailable
          ? "Service momentanément indisponible."
          : "Trop de tentatives. Réessayez dans un instant.",
      },
      { status, headers: { "Retry-After": String(minuteCheck.retryAfter) } },
    );
  }
  const hourCheck = await rateLimit(`checkout:ip:${ip}:h`, RL_PER_HOUR, 3600, { failClosed: true });
  if (!hourCheck.ok) {
    const status = hourCheck.unavailable ? 503 : 429;
    return NextResponse.json(
      {
        error: hourCheck.unavailable
          ? "Service momentanément indisponible."
          : "Trop de tentatives. Réessayez plus tard.",
      },
      { status, headers: { "Retry-After": String(hourCheck.retryAfter) } },
    );
  }

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

    // Cap cart size — an attacker could try to reserve thousands of bottles.
    const totalQty = items.reduce(
      (s, i) => s + (typeof i.quantity === "number" ? i.quantity : 0),
      0,
    );
    if (totalQty > 120) {
      return NextResponse.json({ error: "Cart too large" }, { status: 400 });
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
    // Optional Luxembourg VAT rate (create in Stripe Dashboard and set STRIPE_VAT_RATE_LU
    // to its txr_ id). When set, Stripe shows the correct tax breakdown on invoices.
    const vatRateId = process.env.STRIPE_VAT_RATE_LU;

    const lineItems: {
      price_data: {
        currency: string;
        product_data: { name: string; description?: string };
        unit_amount: number;
        tax_behavior?: "inclusive" | "exclusive" | "unspecified";
      };
      quantity: number;
      tax_rates?: string[];
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
          // Mark prices as tax-inclusive so Stripe invoices match the storefront
          // claim "TVA 17% incluse" even without automatic_tax enabled.
          tax_behavior: "inclusive",
        },
        quantity: item.quantity,
        ...(vatRateId ? { tax_rates: [vatRateId] } : {}),
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
              tax_behavior: "inclusive" as const,
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

    // Generate a per-session nonce. The raw nonce is returned in an HttpOnly
    // cookie; only its SHA-256 digest is stored in Stripe metadata. Reading
    // /api/checkout/session requires the cookie to match — so sharing a
    // success URL does NOT leak order details.
    const nonce = randomBytes(24).toString("base64url");
    const nonceHash = createHash("sha256").update(nonce).digest("hex");

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_options: shippingOptions,
      shipping_address_collection: deliveryMethod === "delivery" ? {
        allowed_countries: ["LU", "FR", "DE", "BE"],
      } : undefined,
      automatic_tax: process.env.STRIPE_AUTOMATIC_TAX === "true"
        ? { enabled: true }
        : undefined,
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRY_SECONDS,
      metadata: {
        deliveryMethod,
        itemsJson: JSON.stringify(items.map((i) => ({ id: i.wineId, qty: i.quantity }))),
        nonceHash,
      },
      success_url: `${origin}/boutique/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/boutique/checkout/cancel`,
    });

    const res = NextResponse.json({ url: session.url });
    res.cookies.set({
      name: "co_nonce",
      value: nonce,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: CHECKOUT_EXPIRY_SECONDS + 60 * 60, // nonce outlives session slightly
    });
    return res;
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
