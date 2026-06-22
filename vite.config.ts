/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import yaml from '@rollup/plugin-yaml';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), yaml()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Playwright E2E lives in /e2e and is run via `npm run test:e2e`
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
});
