/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import { cwd } from 'node:process';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  publicDir: 'public',
  server: {
    port: 4096,
    host: '0.0.0.0',
    open: '#debug',
  },
  resolve: {
    alias: {
      '@': cwd(),
    },
  },
  base: './',
  build: {
    chunkSizeWarningLimit: 1500,
    sourcemap: true,
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  plugins: [glsl()],
  test: {
    setupFiles: ['./tests/unit/__setup__/setup.ts'],
    globals: true,
    environment: 'jsdom',
    coverage: {
      include: ['**/src/**/*.ts'],
      provider: 'v8',
      reporter: ['cobertura', 'text', 'html'],
      exclude: ['*.cjs', '*.config.*', 'dist/**', 'src/**.d.ts', 'tests'],
    },
  },
});
