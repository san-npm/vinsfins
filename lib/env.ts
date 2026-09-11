/**
 * Required environment variables, validated once on first import.
 * Throws in production if anything critical is missing; warns in dev so
 * the app can still boot for local work without the full secret set.
 */

type EnvSpec = {
  name: string;
  critical: boolean;
};

const SPECS: EnvSpec[] = [
  { name: "STRIPE_SECRET_KEY", critical: true },
  { name: "STRIPE_WEBHOOK_SECRET", critical: true },
  { name: "ADMIN_PASSWORD", critical: true },
  { name: "TOKEN_SECRET", critical: true },
  { name: "ADMIN_EMAIL", critical: false },
  // DPD Web Parcel (Packlink). Non-critical on purpose: without it the shop
  // still sells and confirms orders, and parcels are booked by hand in the
  // portal, rather than the whole site refusing to boot.
  { name: "DPD_API_KEY", critical: false },
  { name: "DPD_SENDER_PHONE", critical: false },
  // Without it Vercel Cron cannot call /api/admin/dpd/sync and no customer
  // is ever sent a tracking number.
  { name: "CRON_SECRET", critical: false },
  { name: "KV_REST_API_URL", critical: true },
  { name: "KV_REST_API_TOKEN", critical: true },
];

function validateEnv(): void {
  const missing: string[] = [];
  const missingNonCritical: string[] = [];
  for (const spec of SPECS) {
    if (!process.env[spec.name]) {
      (spec.critical ? missing : missingNonCritical).push(spec.name);
    }
  }

  const isProd = process.env.NODE_ENV === "production";
  if (missing.length > 0) {
    const message = `Missing required env vars: ${missing.join(", ")}`;
    if (isProd) {
      throw new Error(message);
    }
    // eslint-disable-next-line no-console
    console.warn(`[env] ${message} — running with reduced functionality.`);
  }
  if (missingNonCritical.length > 0 && !isProd) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Optional vars missing: ${missingNonCritical.join(", ")}`);
  }
}

// Skip validation during the Next.js build's data-collection phase. The
// build runs without production secrets (those live in Vercel env), so a
// throw here would block any local `next build`. Validation still fires
// on the first real request in production.
function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

let validated = false;
export function ensureEnv(): void {
  if (validated || isBuildPhase()) return;
  validated = true;
  validateEnv();
}

if (!isBuildPhase()) {
  ensureEnv();
}
