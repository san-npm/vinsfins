import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Pin the API version so Stripe dashboard upgrades never silently change
  // response shapes. Keep in sync with the SDK's LatestApiVersion on upgrade.
  apiVersion: "2026-02-25.clover",
  httpClient: Stripe.createFetchHttpClient(),
  maxNetworkRetries: 3,
  timeout: 30000,
});
