import Stripe from "stripe";

// Lazily create the Stripe client. Throwing (or constructing) at module load
// breaks `next build`: its "collect page data" step imports every route —
// including those that import this module — in environments without
// STRIPE_SECRET_KEY (e.g. Vercel Preview deploys). Deferring to first use means
// the key is only required when Stripe is actually called at request time, not
// at import/build time.
let client: Stripe | null = null;

function getStripe(): Stripe {
  if (client) return client;
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error("STRIPE_SECRET_KEY is not set");
  client = new Stripe(apiKey, {
    // Pin the API version so Stripe dashboard upgrades never silently change
    // response shapes. Keep in sync with the SDK's LatestApiVersion on upgrade.
    apiVersion: "2026-04-22.dahlia",
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 3,
    timeout: 30000,
  });
  return client;
}

// Preserve the `import { stripe } from "@/lib/stripe"` call-site API: every
// property access is forwarded to the real client, instantiated (and
// validated) on first use rather than at import/build time.
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const real = getStripe();
    const value = (real as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(real)
      : value;
  },
});
