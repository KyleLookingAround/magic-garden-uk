import { defineConfig } from 'vite';

export default defineConfig({
  // The repo root holds index.html, which is Vite's entry point.
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
  },
});
