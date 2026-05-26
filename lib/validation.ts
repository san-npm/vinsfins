/** Runtime validation for admin API payloads */

const LANGS = ['fr', 'en', 'de', 'lb'] as const;
const MAX_STRING_LENGTH = 2000;
const MAX_ARRAY_LENGTH = 1500;
const MAX_SHORT_STRING = 200;
const MAX_URL_LENGTH = 1000;
const MAX_PRICE = 100_000;

function isLangRecord(val: unknown): val is Record<string, string> {
  if (!val || typeof val !== 'object') return false;
  const obj = val as Record<string, unknown>;
  return LANGS.every(l => typeof obj[l] === 'string' && obj[l].length <= MAX_STRING_LENGTH);
}

function isOptionalLangRecord(val: unknown): boolean {
  if (val === null || val === undefined) return true;
  return isLangRecord(val);
}

function isFiniteNonNegativeNumber(val: unknown, max = MAX_PRICE): val is number {
  return typeof val === 'number' && Number.isFinite(val) && val >= 0 && val <= max;
}

function isOptionalShortString(val: unknown): boolean {
  if (val === undefined || val === null) return true;
  return typeof val === 'string' && val.length <= MAX_SHORT_STRING;
}

function isOptionalImageUrl(val: unknown): boolean {
  if (val === undefined || val === null || val === '') return true;
  if (typeof val !== 'string' || val.length > MAX_URL_LENGTH) return false;
  // Allow only https: URLs (next/image will still gate by remotePatterns,
  // but blocking other schemes here keeps `javascript:`, `data:`, and
  // `file:` out of JSON-LD and email rendering early.
  return /^https:\/\//.test(val);
}

export function validateWines(data: unknown): string | null {
  if (!Array.isArray(data)) return 'Expected an array';
  if (data.length > MAX_ARRAY_LENGTH) return `Too many items (max ${MAX_ARRAY_LENGTH})`;
  for (let i = 0; i < data.length; i++) {
    const w = data[i];
    if (!w || typeof w !== 'object') return `Item ${i}: not an object`;
    if (typeof w.id !== 'string' || w.id.length === 0 || w.id.length > MAX_SHORT_STRING) {
      return `Item ${i}: invalid id`;
    }
    if (typeof w.name !== 'string' || w.name.length === 0 || w.name.length > MAX_SHORT_STRING) {
      return `Item ${i}: invalid name`;
    }
    if (!isFiniteNonNegativeNumber(w.priceBottle)) return `Item ${i}: invalid priceBottle`;
    if (!isFiniteNonNegativeNumber(w.priceShop)) return `Item ${i}: invalid priceShop`;
    if (!isFiniteNonNegativeNumber(w.priceGlass)) return `Item ${i}: invalid priceGlass`;
    if (w.stock !== undefined && !isFiniteNonNegativeNumber(w.stock, 1_000_000)) {
      return `Item ${i}: invalid stock`;
    }
    if (!isOptionalShortString(w.region)) return `Item ${i}: invalid region`;
    if (!isOptionalShortString(w.country)) return `Item ${i}: invalid country`;
    if (!isOptionalShortString(w.grape)) return `Item ${i}: invalid grape`;
    if (!isOptionalShortString(w.supplier)) return `Item ${i}: invalid supplier`;
    if (!isOptionalShortString(w.barcode)) return `Item ${i}: invalid barcode`;
    if (!isOptionalImageUrl(w.image)) return `Item ${i}: invalid image URL (must be https://)`;
    if (!isLangRecord(w.description)) return `Item ${i}: invalid description`;
  }
  return null;
}

export function validateMenu(data: unknown): string | null {
  if (!Array.isArray(data)) return 'Expected an array';
  if (data.length > MAX_ARRAY_LENGTH) return `Too many items (max ${MAX_ARRAY_LENGTH})`;
  for (let i = 0; i < data.length; i++) {
    const m = data[i];
    if (!m || typeof m !== 'object') return `Item ${i}: not an object`;
    if (typeof m.id !== 'string' || m.id.length === 0 || m.id.length > MAX_SHORT_STRING) {
      return `Item ${i}: invalid id`;
    }
    if (!isFiniteNonNegativeNumber(m.price)) return `Item ${i}: invalid price`;
    if (!isLangRecord(m.name)) return `Item ${i}: invalid name`;
    if (!isLangRecord(m.description)) return `Item ${i}: invalid description`;
  }
  return null;
}

export function validateContent(data: unknown): string | null {
  if (!data || typeof data !== 'object') return 'Expected an object';
  const c = data as Record<string, unknown>;
  if (!isLangRecord(c.hours)) return 'Invalid hours';
  if (!isLangRecord(c.closedMessage)) return 'Invalid closedMessage';
  if (!isLangRecord(c.heroTagline)) return 'Invalid heroTagline';
  if (!isOptionalLangRecord(c.announcement)) return 'Invalid announcement';
  if (typeof c.address !== 'string' || c.address.length > MAX_SHORT_STRING) return 'Invalid address';
  if (typeof c.phone !== 'string' || c.phone.length > MAX_SHORT_STRING) return 'Invalid phone';
  // Cheap RFC-5322-ish syntactic check; not a full validator, just catches
  // typos and obvious garbage like newlines/whitespace.
  if (typeof c.email !== 'string' || c.email.length > MAX_SHORT_STRING || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) {
    return 'Invalid email';
  }
  return null;
}
