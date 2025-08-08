const CACHE_NAME = 'procly-v1';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/css/user/usuario.css',
  '/js/supabaseClient.js',
  '/js/user/usuario.js',
  '/assets/logo/icon_32.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devolver desde cache si existe
        if (response) {
          return response;
        }
        
        // Si no está en cache, hacer fetch y cachear
        return fetch(event.request).then(response => {
          // No cachear requests no exitosos o no soportados
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // No cachear requests de chrome-extension o POST
          if (event.request.url.startsWith('chrome-extension://') || 
              event.request.method === 'POST') {
            return response;
          }
          
          // Clonar la respuesta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            })
            .catch(error => {
              console.log('Error cacheando:', error);
            });
          
          return response;
        });
      })
  );
});
