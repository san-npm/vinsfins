/**
 * DPD delivery rates and parcel splitting.
 *
 * Pure and client-safe: no credentials, no network. The Packlink API client
 * that books shipments lives in `@/lib/dpd-api`.
 *
 * DPD's "Web Parcel" offer for Belgium/Luxembourg is a white-labelled Packlink
 * PRO tenant (DPDBBEUN), so the API is Packlink's rather than DPD's:
 * https://api.packlink.com/v1/, authenticated with a raw, scheme-less
 * `Authorization: <key>` header. There is no Bearer prefix and no token
 * exchange — the key is a long-lived credential revocable from the portal.
 *
 * Product: DPD Shop2Home (carrier_product_id LU_DPD_S2H). The shop hands
 * parcels in at a DPD Pickup shop; DPD delivers to the customer's address.
 *
 * The rates below are `price.total_price` (TTC, 17% LU VAT included) read from
 * GET /v1/services on 2026-09-06 for origin L-2160, and are passed through to
 * the customer unchanged. The shop reclaims the VAT it pays DPD and charges
 * the same VAT on, so shipping nets out at cost rather than at a margin.
 * Refresh them with `npm run dpd:rates` whenever DPD revises its tariffs.
 */

export const SHIP_COUNTRIES = ["LU", "FR", "DE", "BE"] as const;
export type ShipCountry = (typeof SHIP_COUNTRIES)[number];

export function isShipCountry(value: unknown): value is ShipCountry {
  return typeof value === "string" && (SHIP_COUNTRIES as readonly string[]).includes(value);
}

const BOTTLE_KG = 1.3;
/** Moulded-pulp bottle insert plus the outer carton. */
const PACKAGING_KG = 1.5;

/**
 * DPD Web Parcel refuses every service above 20 kg — the quote endpoint simply
 * returns an empty service list. This is well under the 31.5 kg that DPD
 * Luxembourg's general terms allow, because the binding limit here is the
 * Web Parcel product, not the carrier's contract maximum.
 */
export const PARCEL_MAX_KG = 20;

/** A standard 12-bottle case: 12 × 1.3 + 1.5 = 17.1 kg, comfortably inside 20. */
export const BOTTLES_PER_PARCEL = 12;

type Tier = { maxKg: number; cents: number };

const RATE_TIERS: Record<ShipCountry, Tier[]> = {
  LU: [{ maxKg: 10, cents: 689 }, { maxKg: 20, cents: 930 }],
  BE: [{ maxKg: 10, cents: 1170 }, { maxKg: 20, cents: 1385 }],
  DE: [{ maxKg: 10, cents: 1434 }, { maxKg: 20, cents: 1650 }],
  FR: [{ maxKg: 10, cents: 1966 }, { maxKg: 20, cents: 2444 }],
};

/** DPD transit time in business days, quoted by the service endpoint. */
const TRANSIT_DAYS: Record<ShipCountry, number> = { LU: 1, BE: 1, DE: 1, FR: 2 };

/**
 * Split an order into parcels and return each parcel's gross weight in kg.
 * Billing is per parcel, so a 24-bottle order is two parcels and two rates.
 */
export function parcelWeights(bottles: number): number[] {
  const weights: number[] = [];
  let remaining = bottles;
  while (remaining > 0) {
    const inParcel = Math.min(remaining, BOTTLES_PER_PARCEL);
    weights.push(Math.round((inParcel * BOTTLE_KG + PACKAGING_KG) * 100) / 100);
    remaining -= inParcel;
  }
  return weights;
}

function tierCents(country: ShipCountry, parcelKg: number): number {
  const tier = RATE_TIERS[country].find((t) => parcelKg <= t.maxKg);
  if (!tier) {
    // Unreachable while BOTTLES_PER_PARCEL keeps parcels at 17.1 kg. Guards
    // against someone raising that constant past what DPD will carry.
    throw new Error(`Parcel of ${parcelKg}kg exceeds the ${PARCEL_MAX_KG}kg DPD limit`);
  }
  return tier.cents;
}

/** Total shipping in cents for an order, billed per parcel. */
export function getShippingCents(bottles: number, country: ShipCountry): number {
  return parcelWeights(bottles).reduce((sum, kg) => sum + tierCents(country, kg), 0);
}

/**
 * Stripe `delivery_estimate` bounds. DPD's quoted transit starts when the
 * parcel is scanned in at the Pickup shop, so the upper bound adds two
 * business days for picking, packing and hand-in.
 */
export function deliveryEstimateDays(country: ShipCountry): { minimum: number; maximum: number } {
  const transit = TRANSIT_DAYS[country];
  return { minimum: transit, maximum: transit + 2 };
}

/**
 * Carrier transit alone, with no handling allowance. schema.org models total
 * delivery as handlingTime + transitTime, so JSON-LD needs this rather than the
 * combined figure above, which would otherwise count handling twice.
 */
export function transitDays(country: ShipCountry): number {
  return TRANSIT_DAYS[country];
}

/** Cheapest possible rate to a country, used for "delivery from X€" copy. */
export function singleBottleRateEur(country: ShipCountry): number {
  return getShippingCents(1, country) / 100;
}
