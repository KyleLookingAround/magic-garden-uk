import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // The repo root holds index.html, which is Vite's entry point.
  root: '.',
  plugins: [
    VitePWA({
      // 'prompt' keeps the new worker waiting so we can show a refresh toast
      // instead of silently swapping the app out from under the user.
      registerType: 'prompt',
      // We register manually from main.js (the strict CSP forbids inline scripts).
      injectRegister: false,
      // Keep the hand-written public/site.webmanifest already linked in index.html.
      manifest: false,
      workbox: {
        // Precache the whole built app so the first load primes a full offline copy.
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
  },
});
