const CACHE_NAME = 'mundial-v2'; // Cambiamos a v2 para forzar al cel a actualizar
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css', // ⚠️ ASEGÚRATE de que se llame EXACTAMENTE igual a tu archivo físico
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalar el Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos un bucle para que si un archivo falla, no arruine toda la instalación
      return Promise.all(
        ASSETS.map(url => {
          return cache.add(url).catch(err => console.log('Error cargando en caché:', url, err));
        })
      );
    })
  );
});

// Procesar peticiones
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    }).catch(() => {
      // Si todo falla y estás offline, redirige a la raíz
      return caches.match('/index.html');
    })
  );
});