// Service worker: makes the planner work offline and installable.
//
// Navigations are network-first (so a new build is picked up when online) with
// a cached app-shell fallback. Hashed build assets are immutable, so they're
// served cache-first. Only same-origin GETs are touched — fonts and any other
// cross-origin requests pass straight through. Requires the page CSP to allow
// connect-src 'self' so the worker's own fetches aren't blocked.
const CACHE = 'magic-garden-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.add('/')).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res && res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
  }
  return res;
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put('/', copy)).catch(() => {});
    return res;
  } catch {
    return (await caches.match('/')) || (await caches.match(request)) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') event.respondWith(networkFirst(request));
  else event.respondWith(cacheFirst(request));
});
