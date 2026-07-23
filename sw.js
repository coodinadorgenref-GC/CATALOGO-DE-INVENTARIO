// sw.js
// Misma estrategia que ya usa Libro·Diario:
// 1) Archivo propio (index.html) -> "red primero": si hay internet, siempre
//    trae la última versión y la guarda en caché; si no hay internet, usa
//    la última copia guardada. Así no hace falta subir un número de versión
//    cada vez que editas el catálogo.
// 2) Librerías externas (Tailwind, Font Awesome) -> "caché primero, refresca
//    detrás", para que carguen rápido y funcionen sin conexión.
//
// IMPORTANTE: esto NO guarda offline los pedidos ni cambios que necesiten
// escribir en Google Sheets (eso siempre requiere internet, igual que hoy).
// Lo que sí logra es que el catálogo abra al instante, con la última data
// vista, aunque no haya señal por un momento.

const CACHE_NAME = 'catalogo-bh-shell'; // fijo: no hace falta incrementarlo a mano

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './imagen-no-disponible.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Nunca cachear las llamadas al backend (Google Apps Script): siempre
  // deben ir directo a la red, para no mostrar datos ni pedidos viejos.
  if (url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')) {
    return; // deja pasar la petición sin intervenir
  }

  if (isSameOrigin) {
    // RED PRIMERO: trae la versión más nueva; si no hay internet, usa la caché.
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.open(CACHE_NAME).then((cache) => cache.match(req)))
    );
    return;
  }

  // CDNs externos (Tailwind, Font Awesome): caché primero, refresca detrás.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cached) => {
        const networkFetch = fetch(req)
          .then((res) => {
            if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
