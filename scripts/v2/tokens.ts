const STOPWORDS = new Set([
  'beer', 'cider', 'wine', 'bottle', 'vin', 'de', 'du', 'la', 'le', 'les',
  'the', 'a', 'an', 'of', 'and', 'et', 'sous', 'pinot', 'noir', 'blanc', 'rouge',
  'magnum', 'jeroboam', 'cl', 'l', 'ml',
]);

const VOLUME_RE = /^\d+[.,]?\d*(cl|l|ml)$/i;
const YEAR_RE = /^(19|20)\d{2}$/;

function splitTokens(s: string): string[] {
  return s
    .replace(/[''""«»""''`]/g, ' ')
    .replace(/[^a-zA-ZÀ-ÿ0-9\s,.']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function extractProducerToken(wineName: string): string | null {
  const raw = splitTokens(wineName);
  const allCaps = raw.find(
    (t) => t.length >= 4 && t === t.toUpperCase() && /[A-Z]/.test(t) && !VOLUME_RE.test(t) && !STOPWORDS.has(t.toLowerCase())
  );
  if (allCaps) return allCaps.toLowerCase();

  const significant = raw
    .map((t) => t.toLowerCase())
    .filter(
      (t) =>
        t.length >= 4 &&
        !STOPWORDS.has(t) &&
        !VOLUME_RE.test(t) &&
        !YEAR_RE.test(t) &&
        !/^\d/.test(t)
    );
  if (significant.length === 0) return null;
  return significant.sort((a, b) => b.length - a.length)[0];
}

export function extractWineTokens(wineName: string, producerToken: string | null): string[] {
  return splitTokens(wineName)
    .map((t) => t.toLowerCase())
    .filter(
      (t) =>
        t.length >= 3 &&
        !STOPWORDS.has(t) &&
        !VOLUME_RE.test(t) &&
        !YEAR_RE.test(t) &&
        t !== producerToken
    );
}
