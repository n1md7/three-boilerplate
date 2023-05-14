import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  server: {
    port: 4096,
    host: '0.0.0.0',
    open: true,
  },
  resolve: {
    alias: {
      '@': process.cwd(),
    },
  },
  base: './',
  build: {
    chunkSizeWarningLimit: 700,
    sourcemap: true,
    assetsDir: 'assets',
  },
  base: './',
});
