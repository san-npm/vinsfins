import Stripe from "stripe";

let _stripe: Stripe | null = null;

// Lazy init so the module can be imported during `next build` page-data
// collection without STRIPE_SECRET_KEY being set in every preview env.
// The first runtime call constructs the client; subsequent calls reuse it.
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    // Pin the API version so Stripe dashboard upgrades never silently change
    // response shapes. Keep in sync with the SDK's LatestApiVersion on upgrade.
    apiVersion: "2026-02-25.clover",
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 3,
    timeout: 30000,
  });
  return _stripe;
}
