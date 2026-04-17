import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/v2/integration/**', 'node_modules/**'],
    testTimeout: 10_000,
  },
});
