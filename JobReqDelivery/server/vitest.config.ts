import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    testTimeout: 180000, // 3分钟超时
    hookTimeout: 60000,
    teardownTimeout: 10000
  }
});
