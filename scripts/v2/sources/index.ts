import type { Wine, Candidate } from '../types';
import { searchVivino } from './vivino';
import { searchWineSearcher } from './wine-searcher';
import { searchProducer } from './producer';
import { searchBing } from './bing';

export interface Source {
  name: Candidate['source'];
  search: (wine: Wine) => Promise<Candidate[]>;
}

export const SOURCES: Source[] = [
  { name: 'vivino', search: searchVivino },
  { name: 'wine-searcher', search: searchWineSearcher },
  { name: 'producer', search: searchProducer },
  { name: 'bing', search: searchBing },
];
