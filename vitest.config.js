import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    restoreMocks: true,
    coverage: {
      include: ['commands/**', 'lib/**'],
      reporter: ['text', 'html'],
    },
  },
});
