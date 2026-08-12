// HabitBloom service worker — enables offline use and installability.
// Bump CACHE_VERSION whenever the app shell changes shape so old caches are dropped.

const CACHE_VERSION = 'v2';
const CACHE_NAME = `habitbloom-${CACHE_VERSION}`;

// Derive the cache namespace and shell paths from the registration scope so
// the worker works under any BASE_PATH, not just a root deployment.
const scope = self.registration.scope;

const cacheKey = (path: string) => new URL(path, scope).toString();

const APP_SHELL = [
  scope,
  'manifest.webmanifest',
  'favicon.svg',
].map(cacheKey);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('habitbloom-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Network-first for navigations (so users get fresh content when online),
// falling back to the cached shell when offline. Cache-first for static
// assets built by Vite (hashed filenames are safe to cache indefinitely).
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(scope, copy));
          return response;
        })
        .catch(() => caches.match(scope)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
    }),
  );
});