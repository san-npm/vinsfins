import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/v2/integration/**', 'node_modules/**'],
    testTimeout: 10_000,
  },
});
