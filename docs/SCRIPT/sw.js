const CACHE_NAME = 'vidalink-v1';
const ASSETS = [
  '/',
  '/docs/index.html',
  '/docs/CSS/styles.css',
  '/docs/RECURSOS/logo.png',
  '/docs/RECURSOS/vidalink.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // CACHÉ ESPECIAL PARA LOS MAPAS DE LEAFLET (OpenStreetMap)
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(event.request).then(networkResponse => {
          return caches.open('vidalink-maps-cache').then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Comportamiento normal para el resto de la app
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});