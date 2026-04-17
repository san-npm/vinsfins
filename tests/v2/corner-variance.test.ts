import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { cornerVariance } from '../../scripts/v2/corner-variance';

describe('cornerVariance', () => {
  it('returns low variance for clean white-corner image', async () => {
    const buf = readFileSync(join(__dirname, 'fixtures/clean-bottle.jpg'));
    const v = await cornerVariance(buf);
    expect(v).toBeLessThan(0.15);
  });

  it('returns high variance for busy background', async () => {
    const buf = readFileSync(join(__dirname, 'fixtures/busy-background.jpg'));
    const v = await cornerVariance(buf);
    expect(v).toBeGreaterThan(0.15);
  });
});
