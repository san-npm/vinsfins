import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { wines } from "@/data/wines";
import { loadData, saveData } from "@/lib/storage";

const STOCK_KEY = "stock-adjustments";

interface StockAdjustments {
  [wineId: string]: number; // negative = sold, positive = restocked
}

/**
 * Load stock adjustments from Vercel Blob.
 * These represent changes from the original static inventory.
 */
async function getAdjustments(): Promise<StockAdjustments> {
  return (await loadData(STOCK_KEY, {})) as StockAdjustments;
}

/**
 * Get effective stock for a wine (original stock + adjustments).
 */
export async function getEffectiveStock(wineId: string): Promise<number> {
  const wine = wines.find((w) => w.id === wineId);
  if (!wine) return 0;
  const adjustments = await getAdjustments();
  const adj = adjustments[wineId] || 0;
  return Math.max(0, (wine.stock ?? 999) + adj);
}

/**
 * Decrement stock for all items in a completed checkout session.
 */
export async function updateStock(session: Stripe.Checkout.Session): Promise<void> {
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
    });

    const adjustments = await getAdjustments();

    for (const item of lineItems.data) {
      // Match line item back to wine by name
      const wine = wines.find((w) => w.name === item.description);
      if (wine && item.quantity) {
        adjustments[wine.id] = (adjustments[wine.id] || 0) - item.quantity;
        console.log(`Stock updated: ${wine.name} -${item.quantity} (adj: ${adjustments[wine.id]})`);
      }
    }

    await saveData(STOCK_KEY, adjustments);
    console.log("Stock adjustments saved");
  } catch (err) {
    console.error("Failed to update stock:", err);
  }
}

/**
 * Check if all items in a cart are in stock.
 * Returns null if OK, or the first out-of-stock wine name.
 */
export async function checkStock(
  items: { wineId: string; quantity: number }[],
): Promise<string | null> {
  const adjustments = await getAdjustments();

  for (const item of items) {
    const wine = wines.find((w) => w.id === item.wineId);
    if (!wine) continue;
    const available = Math.max(0, (wine.stock ?? 999) + (adjustments[wine.id] || 0));
    if (item.quantity > available) {
      return wine.name;
    }
  }
  return null;
}
