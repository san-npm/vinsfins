import type { Wine, Candidate, ValidationResult } from './types';
import { extractProducerToken, extractWineTokens } from './tokens';

export const WINE_RETAILER_DOMAINS = [
  'vivino.com', 'images.vivino.com',
  'wine-searcher.com', 'img.wine-searcher.com',
  'bodeboca.com', 'millesima.com', 'plonk.com',
  'naturalwine.com', 'coolvines.com',
  'lieu-dit.dk', 'more-than-wine.com',
];

export const BLOCKED_DOMAINS = [
  'pinterest.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'youtube.com', 'tiktok.com', 'reddit.com', 'wikipedia.org',
  'shutterstock', 'getty', 'alamy', 'dreamstime', 'istock',
];

function hostOf(url: string): string {
  try { return new URL(url).hostname.toLowerCase(); }
  catch { return ''; }
}

export function scoreCandidate(
  wine: Wine,
  cand: Candidate,
  cornerVar?: number
): ValidationResult {
  const reasons: string[] = [];
  const producer = extractProducerToken(wine.name);
  const wineTokens = extractWineTokens(wine.name, producer);

  const aspectRatio = cand.width && cand.height ? cand.height / cand.width : undefined;
  const minSide = cand.width && cand.height ? Math.min(cand.width, cand.height) : undefined;
  const haystack = (cand.imageUrl + ' ' + cand.sourcePageUrl + ' ' + cand.sourcePageTitle).toLowerCase();

  const producerTokenHit = producer ? haystack.includes(producer) : false;
  const wineTokenCount = wineTokens.filter((t) => haystack.includes(t)).length;

  const host = hostOf(cand.imageUrl);
  const domainAllowed = WINE_RETAILER_DOMAINS.some((d) => host.endsWith(d));
  const domainBlocked = BLOCKED_DOMAINS.some((d) => host.includes(d));

  const metrics = { aspectRatio, minSide, producerTokenHit, wineTokenCount, domainAllowed, domainBlocked, cornerVariance: cornerVar };

  if (domainBlocked) { reasons.push('blocked-domain'); return { confidence: 'NONE', reasons, metrics }; }
  if (!aspectRatio || aspectRatio < 1.3) { reasons.push('bad-aspect'); return { confidence: 'NONE', reasons, metrics }; }
  if (!minSide || minSide < 600) { reasons.push('too-small'); return { confidence: 'NONE', reasons, metrics }; }
  if (!producerTokenHit && wineTokenCount === 0) { reasons.push('no-token-match'); return { confidence: 'NONE', reasons, metrics }; }

  const hardSignals = [producerTokenHit, wineTokenCount >= 2, domainAllowed, cornerVar === undefined || cornerVar < 0.15];
  const passing = hardSignals.filter(Boolean).length;

  if (passing === 4) { reasons.push('all-signals-pass'); return { confidence: 'HIGH', reasons, metrics }; }
  if (producerTokenHit && passing >= 3) { reasons.push('one-signal-miss'); return { confidence: 'MEDIUM', reasons, metrics }; }
  if (producerTokenHit || wineTokenCount >= 1) { reasons.push('weak-match'); return { confidence: 'LOW', reasons, metrics }; }
  reasons.push('insufficient-signals');
  return { confidence: 'NONE', reasons, metrics };
}
