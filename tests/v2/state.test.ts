import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { readState, writeState } from '../../scripts/v2/state';

describe('state', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'v2-state-'));
  });

  it('returns empty array when file missing', () => {
    expect(readState<number>(join(dir, 'missing.json'))).toEqual([]);
  });

  it('round-trips data', () => {
    const path = join(dir, 'data.json');
    writeState(path, [1, 2, 3]);
    expect(readState<number>(path)).toEqual([1, 2, 3]);
    rmSync(dir, { recursive: true });
  });
});
