// sw.js
// 1) Archivo propio (index.html, manifest, íconos) -> "caché primero,
//    actualiza detrás" (stale-while-revalidate): si ya hay una copia
//    guardada de una visita anterior, se muestra AL INSTANTE, sin
//    esperar a la red — y la versión más nueva se descarga en segundo
//    plano para la próxima vez. Solo si NUNCA se ha abierto en ese
//    dispositivo (sin nada guardado todavía) se espera a la red.
// 2) Librerías externas (Tailwind, Font Awesome) -> "caché primero, refresca
//    detrás", para que carguen rápido y funcionen sin conexión.
//
// IMPORTANTE: esto NO guarda offline los pedidos ni cambios que necesiten
// escribir en Google Sheets (eso siempre requiere internet, igual que hoy).
// Lo que sí logra es que el catálogo abra al instante, con la última data
// vista, aunque no haya señal por un momento — y se refresque solo en
// cuanto vuelva a haber conexión, sin que el usuario tenga que esperar
// ni hacer nada.

const CACHE_NAME = 'catalogo-bh-shell'; // fijo: no hace falta incrementarlo a mano

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
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
    // NUEVO — CAMBIO DE ESTRATEGIA: antes era "red primero", lo que
    // significaba que con señal débil el navegador se quedaba
    // esperando la respuesta de red (sin límite de tiempo) ANTES de
    // poder mostrar nada — ni siquiera el HTML alcanzaba a cargar para
    // que el JS corriera y mostrara el catálogo desde localStorage. Eso
    // se sentía como "se queda preparando el camino" aunque el celular
    // sí tuviera algo de señal.
    //
    // Ahora es "caché primero, actualiza detrás" (stale-while-revalidate):
    //  - Si ya hay una copia guardada (visita anterior), se entrega AL
    //    INSTANTE, sin esperar a la red. La descarga de la versión más
    //    nueva sigue en segundo plano y se guarda para la próxima vez —
    //    así "cuando haya señal, se actualiza todo" sin bloquear la
    //    apertura de hoy.
    //  - Si NO hay copia guardada todavía (primera visita en ese
    //    dispositivo), no queda opción: hay que esperar la red, igual
    //    que antes.
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cachedRes) => {
          const actualizarEnSegundoPlano = fetch(req)
            .then((res) => {
              if (res && res.ok) cache.put(req, res.clone());
              return res;
            })
            .catch(() => null);

          if (cachedRes) {
            // No se espera la promesa de red: se deja corriendo sola.
            return cachedRes;
          }
          return actualizarEnSegundoPlano.then(
            (res) => res || new Response(
              "Sin conexión y sin versión guardada todavía en este dispositivo. Conéctate a internet al menos una vez para poder usar el catálogo sin señal después.",
              { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
            )
          );
        })
      )
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
