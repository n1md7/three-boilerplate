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
  build: {
    chunkSizeWarningLimit: 700,
    sourcemap: true,
  },
});
