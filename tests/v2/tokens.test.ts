import { describe, it, expect } from 'vitest';
import { extractProducerToken, extractWineTokens } from '../../scripts/v2/tokens';

describe('extractProducerToken', () => {
  it('prefers ALL-CAPS token of length >= 4', () => {
    expect(extractProducerToken("BEER WoopWoop sous voile ANTIDOOT 0,75cl")).toBe('antidoot');
  });

  it('falls back to longest significant token if no ALL-CAPS', () => {
    expect(extractProducerToken("Domaine Gramenon La Sagesse 2022")).toBe('gramenon');
  });

  it('returns null for unrecognizable names', () => {
    expect(extractProducerToken("Pinot Noir 2019")).toBeNull();
  });
});

describe('extractWineTokens', () => {
  it('strips stopwords, producer token, years, volumes', () => {
    const tokens = extractWineTokens("BEER WoopWoop sous voile ANTIDOOT 0,75cl", 'antidoot');
    expect(tokens).toContain('woopwoop');
    expect(tokens).toContain('voile');
    expect(tokens).not.toContain('beer');
    expect(tokens).not.toContain('antidoot');
    expect(tokens).not.toContain('0,75cl');
  });

  it('lowercases and removes non-word chars', () => {
    expect(extractWineTokens("L'Ambigu Riesling", null)).toEqual(['ambigu', 'riesling']);
  });
});
