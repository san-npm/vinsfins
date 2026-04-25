import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { wines as staticWines, type Wine } from "@/data/wines";
import { loadData } from "@/lib/storage";
import { kv } from "@vercel/kv";

async function getCurrentWines(): Promise<Wine[]> {
  return (await loadData("wines", staticWines)) as Wine[];
}

/**
 * Stock is stored in Vercel KV (Redis) for atomic operations.
 * Key pattern: stock:{wineId} → number (effective stock count)
 *
 * On first access for a wine, the KV key is initialized from the
 * static wine data (wine.stock). After that, all decrements are
 * atomic via DECRBY — no race conditions.
 */

const STOCK_PREFIX = "stock:";
const STOCK_INITIALIZED_KEY = "stock:__initialized__";

/**
 * Ensure stock is initialized in KV for a wine.
 * Uses SETNX (set-if-not-exists) so concurrent calls are safe.
 */
async function ensureStockInitialized(wine: Wine): Promise<void> {
  const key = `${STOCK_PREFIX}${wine.id}`;
  // SETNX: only sets if key doesn't exist — atomic, no race condition
  const wasSet = await kv.setnx(key, wine.stock ?? 999);
  if (wasSet) {
    console.log(`Stock initialized: ${wine.name} = ${wine.stock ?? 999}`);
  }
}

/**
 * Get effective stock for a wine.
 */
export async function getEffectiveStock(wineId: string): Promise<number> {
  const wines = await getCurrentWines();
  const wine = wines.find((w) => w.id === wineId);
  if (!wine) return 0;

  await ensureStockInitialized(wine);
  const stock = await kv.get<number>(`${STOCK_PREFIX}${wineId}`);
  return Math.max(0, stock ?? 0);
}

/**
 * Atomically decrement stock for all items in a completed checkout session.
 * Uses Redis DECRBY — no read-then-write race condition.
 */
export async function updateStock(session: Stripe.Checkout.Session): Promise<void> {
  try {
    const lineItems = await getStripe().checkout.sessions.listLineItems(session.id, {
      limit: 100,
    });

    const wines = await getCurrentWines();

    for (const item of lineItems.data) {
      const wine = wines.find((w) => w.name === item.description);
      if (wine && item.quantity) {
        await ensureStockInitialized(wine);
        const newStock = await kv.decrby(`${STOCK_PREFIX}${wine.id}`, item.quantity);
        console.log(`Stock decremented: ${wine.name} -${item.quantity} (now: ${newStock})`);
      }
    }
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
  const wines = await getCurrentWines();

  for (const item of items) {
    const wine = wines.find((w) => w.id === item.wineId);
    if (!wine) continue;

    await ensureStockInitialized(wine);
    const available = await kv.get<number>(`${STOCK_PREFIX}${wine.id}`);
    if ((available ?? 0) < item.quantity) {
      return wine.name;
    }
  }
  return null;
}

/**
 * Reserve stock atomically during checkout.
 * Decrements immediately — if payment fails, stock is restored via releaseStock.
 * Returns null if successful, or the first out-of-stock wine name.
 */
export async function reserveStock(
  items: { wineId: string; quantity: number }[],
): Promise<string | null> {
  const wines = await getCurrentWines();
  const decremented: { wineId: string; quantity: number }[] = [];

  for (const item of items) {
    const wine = wines.find((w) => w.id === item.wineId);
    if (!wine) continue;

    await ensureStockInitialized(wine);
    const newStock = await kv.decrby(`${STOCK_PREFIX}${wine.id}`, item.quantity);

    if (newStock < 0) {
      // Went negative — restore and fail
      await kv.incrby(`${STOCK_PREFIX}${wine.id}`, item.quantity);
      // Restore all previously decremented items
      for (const prev of decremented) {
        await kv.incrby(`${STOCK_PREFIX}${prev.wineId}`, prev.quantity);
      }
      return wine.name;
    }

    decremented.push({ wineId: wine.id, quantity: item.quantity });
  }

  return null; // All items reserved
}

/**
 * Release reserved stock (e.g., payment failed or cancelled).
 */
export async function releaseStock(
  items: { wineId: string; quantity: number }[],
): Promise<void> {
  for (const item of items) {
    await kv.incrby(`${STOCK_PREFIX}${item.wineId}`, item.quantity);
  }
}
