/**
 * Packlink API client for DPD Web Parcel.
 *
 * Server-only: nothing in the browser bundle may import this file. The rate
 * maths a client component needs lives in `@/lib/dpd`, which is pure and free
 * of both credentials and network calls.
 *
 * See `@/lib/dpd` for why this is Packlink's API and not DPD's.
 */
import { parcelWeights } from "@/lib/dpd";

const API_BASE = "https://api.packlink.com/v1";
const SERVICE_NAME = "Shop2Home";

/** Outer carton for a 6-to-12 bottle case, in cm. Well inside DPD's 250cm girth. */
const PARCEL_CM = { length: 40, width: 33, height: 30 };

export interface DpdAddress {
  name: string;
  street1: string;
  street2?: string;
  zip: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface DpdShipment {
  reference: string;
  state?: string;
  trackingCodes: string[];
  trackingUrl?: string;
}

/** True when the integration is configured. Everything below is inert without it. */
export function isDpdConfigured(): boolean {
  return Boolean(process.env.DPD_API_KEY);
}

function senderAddress(): DpdAddress {
  return {
    name: process.env.DPD_SENDER_NAME || "Vins Fins",
    street1: process.env.DPD_SENDER_STREET || "18 Rue Münster",
    zip: process.env.DPD_SENDER_ZIP || "2160",
    city: process.env.DPD_SENDER_CITY || "Luxembourg",
    country: "LU",
    phone: process.env.DPD_SENDER_PHONE || "",
    email: process.env.DPD_SENDER_EMAIL || process.env.ADMIN_EMAIL || "contact@vinsfins.lu",
  };
}

/**
 * Booking runs inside the Stripe webhook, which Stripe abandons and retries if
 * we take too long. An unbounded fetch would let a hung Packlink hold the whole
 * handler open past that deadline, and the retry is then swallowed by the
 * idempotency claim — the order silently ends up with no parcel and no alert.
 * Failing fast instead lets the caller send the shop a "book this by hand" email.
 */
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Strip anything that looks like the credential out of text that is about to be
 * logged or emailed. Packlink echoes request context in some error bodies, and
 * this text reaches both Vercel's logs and the shop's inbox.
 */
function redact(text: string): string {
  const key = process.env.DPD_API_KEY;
  if (!key) return text;
  // Case-insensitive, so a key echoed back in different casing is still caught.
  // Deliberately NOT a generic hex-run match: that also ate Packlink request ids
  // and shipment references, which are exactly what support asks for.
  return text.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "[redacted]");
}

async function call<T>(path: string, init?: RequestInit, signal?: AbortSignal): Promise<T> {
  const key = process.env.DPD_API_KEY;
  if (!key) throw new Error("DPD_API_KEY is not set");

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      // A caller that makes several calls passes ONE signal so the whole
      // operation is bounded. Without that, booking (quote + create) would
      // budget 8s but actually take up to 16s.
      signal: signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        // Packlink expects the raw key here. A "Bearer " prefix is rejected:
        // that form belongs to the separate OAuth flow that mints keys.
        Authorization: key,
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (err) {
    // Node reports every transport failure as "fetch failed"; the diagnosis is
    // in err.cause, so keep it.
    const cause = err instanceof Error && err.cause instanceof Error ? `: ${redact(err.cause.message)}` : "";
    const reason = err instanceof Error && err.name === "TimeoutError"
      ? `timed out after ${REQUEST_TIMEOUT_MS}ms`
      : `network error${cause}`;
    throw new Error(`DPD ${init?.method ?? "GET"} ${safePath(path)}: ${reason}`);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `DPD ${init?.method ?? "GET"} ${safePath(path)} failed: ${res.status} ${redact(detail).slice(0, 300)}`,
    );
  }
  try {
    return (await res.json()) as T;
  } catch {
    // Reading the body can abort on the shared deadline, and a proxy error page
    // parses as a SyntaxError that quotes the body. Neither should escape raw.
    throw new Error(`DPD ${init?.method ?? "GET"} ${safePath(path)}: invalid response body`);
  }
}

/**
 * Error messages reach Vercel's logs and the shop's inbox. The quote call puts
 * the customer's destination postcode in the query string, which has no place
 * in either, so only the endpoint is ever reported.
 */
function safePath(path: string): string {
  return redact(path.split("?")[0]);
}

type PacklinkService = { id: number; name: string; carrier_name: string };

/**
 * Resolve the Shop2Home service for a route. Asking at booking time rather
 * than hardcoding the service id means a DPD-side product change surfaces as
 * a clear "service unavailable" error instead of a silently wrong booking.
 */
async function findService(
  to: DpdAddress,
  packages: { weight: number }[],
  signal?: AbortSignal,
): Promise<PacklinkService> {
  const sender = senderAddress();
  const params = new URLSearchParams({
    platform: "PRO",
    source: "PRO",
    "from[country]": sender.country,
    "from[zip]": sender.zip,
    "to[country]": to.country,
    "to[zip]": to.zip,
  });
  packages.forEach((pkg, i) => {
    params.set(`packages[${i}][weight]`, String(pkg.weight));
    params.set(`packages[${i}][length]`, String(PARCEL_CM.length));
    params.set(`packages[${i}][width]`, String(PARCEL_CM.width));
    params.set(`packages[${i}][height]`, String(PARCEL_CM.height));
  });

  const services = await call<PacklinkService[]>(`/services?${params.toString()}`, undefined, signal);
  const service = services.find((s) => s.name === SERVICE_NAME);
  if (!service) {
    throw new Error(`DPD ${SERVICE_NAME} unavailable for ${to.country} ${to.zip}`);
  }
  return service;
}

/**
 * Create the DPD shipment for a paid order.
 *
 * This creates a DRAFT: it appears in the Web Parcel portal fully addressed,
 * and the shop confirms and pays for it there. Nothing is charged to the DPD
 * account by this call, which is deliberate — a webhook should not be able to
 * spend money on its own.
 */
export async function createDraftShipment(input: {
  orderRef: string;
  bottles: number;
  contentValueEur: number;
  to: DpdAddress;
}): Promise<{ reference: string }> {
  const packages = parcelWeights(input.bottles).map((weight) => ({ ...PARCEL_CM, weight }));
  // One deadline for quote + create together, so the caller's time budget holds.
  const deadline = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const service = await findService(input.to, packages, deadline);
  const sender = senderAddress();

  const body = {
    platform: "PRO",
    platform_country: "UN",
    source: "PRO",
    service: service.name,
    carrier: service.carrier_name,
    service_id: service.id,
    content: "Wine",
    contentvalue: Math.round(input.contentValueEur * 100) / 100,
    contentValue_currency: "EUR",
    content_second_hand: false,
    shipment_custom_reference: input.orderRef,
    has_customs: false,
    from: toApiAddress(sender),
    to: toApiAddress(input.to),
    packages,
  };

  const created = await call<{ reference?: string }>(
    "/shipments",
    { method: "POST", body: JSON.stringify(body) },
    deadline,
  );
  if (!created.reference) {
    throw new Error("DPD accepted the shipment but returned no reference");
  }
  return { reference: created.reference };
}

function toApiAddress(a: DpdAddress) {
  return {
    name: a.name,
    surname: "",
    company: "",
    street1: a.street1,
    street2: a.street2 ?? "",
    zip_code: a.zip,
    city: a.city,
    country: a.country,
    phone: a.phone ?? "",
    email: a.email ?? "",
  };
}

/** Read a shipment back. Tracking codes appear once the label is paid for. */
export async function getShipment(reference: string): Promise<DpdShipment | null> {
  try {
    const s = await call<{
      state?: string;
      tracking_codes?: string[];
      tracking_url?: string;
    }>(`/shipments/${encodeURIComponent(reference)}`);
    return {
      reference,
      state: s.state,
      trackingCodes: s.tracking_codes ?? [],
      trackingUrl: s.tracking_url,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes(" 404 ")) return null;
    throw err;
  }
}

/** Public DPD tracking page for a parcel number. */
export function trackingUrl(code: string): string {
  return `https://www.dpdgroup.com/lu/mydpd/my-parcels/track?parcelNumber=${encodeURIComponent(code)}`;
}
