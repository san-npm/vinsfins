import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { wines } from "@/data/wines";

interface CartItemPayload {
  wineId: string;
  quantity: number;
}

const SHIPPING_THRESHOLD = 100; // Free shipping above this
const SHIPPING_COST = 5; // EUR flat rate

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

    // Validate items against the wine database (server-side price truth)
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
      if (!item.wineId || typeof item.quantity !== "number" || item.quantity < 1 || item.quantity > 99) {
        return NextResponse.json({ error: `Invalid item: ${item.wineId}` }, { status: 400 });
      }

      const wine = wines.find((w) => w.id === item.wineId);
      if (!wine) {
        return NextResponse.json({ error: `Wine not found: ${item.wineId}` }, { status: 400 });
      }
      if (wine.priceShop <= 0) {
        return NextResponse.json({ error: `Wine not available for purchase: ${wine.name}` }, { status: 400 });
      }

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

    // Add shipping line if delivery and under threshold
    if (deliveryMethod === "delivery" && subtotal < SHIPPING_THRESHOLD * 100) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Livraison / Shipping" },
          unit_amount: SHIPPING_COST * 100,
        },
        quantity: 1,
      });
    }

    // Use server-side config only — never trust the Origin header for redirect URLs
    const origin = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
      || "https://vinsfins.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: deliveryMethod === "delivery" ? {
        allowed_countries: ["LU", "FR", "DE", "BE"],
      } : undefined,
      metadata: {
        deliveryMethod,
      },
      success_url: `${origin}/boutique/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/boutique/panier`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", message, err);
    return NextResponse.json(
      { error: "Failed to create checkout session", detail: message },
      { status: 500 }
    );
  }
}
