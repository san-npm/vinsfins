/** Runtime validation for admin API payloads */

const LANGS = ['fr', 'en', 'de', 'lb'] as const;
const MAX_STRING_LENGTH = 2000;
const MAX_ARRAY_LENGTH = 1500;

function isLangRecord(val: unknown): val is Record<string, string> {
  if (!val || typeof val !== 'object') return false;
  const obj = val as Record<string, unknown>;
  return LANGS.every(l => typeof obj[l] === 'string' && obj[l].length <= MAX_STRING_LENGTH);
}

function isOptionalLangRecord(val: unknown): boolean {
  if (val === null || val === undefined) return true;
  return isLangRecord(val);
}

export function validateWines(data: unknown): string | null {
  if (!Array.isArray(data)) return 'Expected an array';
  if (data.length > MAX_ARRAY_LENGTH) return `Too many items (max ${MAX_ARRAY_LENGTH})`;
  for (let i = 0; i < data.length; i++) {
    const w = data[i];
    if (!w || typeof w !== 'object') return `Item ${i}: not an object`;
    if (typeof w.id !== 'string') return `Item ${i}: missing id`;
    if (typeof w.name !== 'string') return `Item ${i}: missing name`;
    if (typeof w.priceBottle !== 'number') return `Item ${i}: missing priceBottle`;
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
    if (typeof m.id !== 'string') return `Item ${i}: missing id`;
    if (typeof m.price !== 'number') return `Item ${i}: missing price`;
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
  if (typeof c.address !== 'string') return 'Invalid address';
  if (typeof c.phone !== 'string') return 'Invalid phone';
  if (typeof c.email !== 'string') return 'Invalid email';
  return null;
}
