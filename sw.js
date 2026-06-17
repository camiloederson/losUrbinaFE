const CACHE_NAME = 'worldcup-v1';
const ASSETS = [
  'predictor.html',
  'manifest.json'
];

// Instalación del SW: Almacena los recursos estáticos estructurales
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activación del SW: Limpieza de cachés antiguas si las hay
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Estrategia Network-First para asegurar que las consultas a Spring Boot traigan datos frescos
self.addEventListener('fetch', (e) => {
  // Ignoramos las llamadas a la API de backend para que no se almacenen datos desactualizados en caché
  if (e.request.url.includes('/api/')) {
    return;
  }
  
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});