import type { Wine, Candidate } from '../types';
import { searchVivino } from './vivino';
import { searchWineSearcher } from './wine-searcher';
import { searchProducer } from './producer';
import { searchBing } from './bing';

export interface Source {
  name: Candidate['source'];
  search: (wine: Wine) => Promise<Candidate[]>;
}

// Full source registry (future use when Vivino/Wine-Searcher become scrapable again).
export const ALL_SOURCES: Source[] = [
  { name: 'vivino', search: searchVivino },
  { name: 'wine-searcher', search: searchWineSearcher },
  { name: 'producer', search: searchProducer },
  { name: 'bing', search: searchBing },
];

// Active source set for live runs. Vivino returns only JS-rendered fallback
// placeholders over plain HTTP; Wine-Searcher 403s behind Cloudflare; Producer
// og:image guesses almost always return a logo, not a bottle. Bing is the only
// source that actually yields useful candidates without browser automation.
export const SOURCES: Source[] = [
  { name: 'bing', search: searchBing },
];
