// scripts/v2/types.ts

export interface Wine {
  id: string;
  name: string;
  region: string;
  country: string;
  grape: string;
  category: 'red' | 'white' | 'orange' | 'sparkling' | 'beer' | 'cider';
  image: string;
}

export interface Candidate {
  imageUrl: string;
  sourcePageUrl: string;
  sourcePageTitle: string;
  source: 'vivino' | 'wine-searcher' | 'producer' | 'bing';
  width?: number;
  height?: number;
}

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface ValidationResult {
  confidence: Confidence;
  reasons: string[];
  metrics: {
    aspectRatio?: number;
    minSide?: number;
    producerTokenHit: boolean;
    wineTokenCount: number;
    domainAllowed: boolean;
    domainBlocked: boolean;
    cornerVariance?: number;
  };
}

export interface AuditRecord {
  wineId: string;
  currentImageUrl: string;
  result: ValidationResult | { confidence: 'NONE'; reasons: ['fetch-failed']; metrics: any };
  passed: boolean;
}

export interface ClassifiedRecord {
  wineId: string;
  decision: 'keep' | 'auto-accept' | 'flag';
  chosen?: Candidate & { validation: ValidationResult };
  candidates: Array<Candidate & { validation: ValidationResult }>;
}

export interface Decision {
  wineId: string;
  action: 'accept' | 'pasted-url' | 'placeholder' | 'skip';
  imageUrl?: string;
  pastedUrl?: string;
  placeholderCategory?: string;
  timestamp: number;
}
