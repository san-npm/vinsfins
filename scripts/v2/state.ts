import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export function readState<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, 'utf-8')) as T[];
}

export function writeState<T>(path: string, data: T[]): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
}
