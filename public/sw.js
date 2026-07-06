// Whiskerwatch service worker.
//
// Whiskerwatch has no backend: every byte it needs is static (the app shell and
// its hashed assets). So the goal here is purely offline availability — once the
// app has been opened online, it must keep working at the table with no network.
//
// Strategy:
//   • Navigations  → network-first, falling back to the cached app shell so a
//                    hard refresh offline still boots the app.
//   • Static GETs  → stale-while-revalidate: serve from cache instantly, refresh
//                    the cache in the background when online. This avoids having
//                    to know Vite's hashed filenames at build time.
// Campaign data itself lives in localStorage/IndexedDB, not here — the SW only
// caches the code needed to run the app.

const CACHE = 'whiskerwatch-v1';
const APP_SHELL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['/', APP_SHELL, '/manifest.webmanifest', '/icon.svg']))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // App navigations: try the network, fall back to the cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(APP_SHELL, copy));
          return response;
        })
        .catch(() => caches.match(APP_SHELL).then((cached) => cached ?? caches.match('/'))),
    );
    return;
  }

  // Everything else (JS, CSS, fonts, icons): stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? network;
      }),
    ),
  );
});
