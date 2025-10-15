// service-worker.js
const CACHE_NAME = 'webgis-story-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './js/router.js',
  './js/main.js',
  './js/add.js',
  './js/login.js',
  './js/register.js',
  './js/home.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install SW & cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Menyimpan cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate SW & hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Service Worker: Menghapus cache lama', name);
            return caches.delete(name);
          }
        })
      )
    )
  );
});

// Fetch request
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() =>
          new Response('Offline Mode: Data tidak tersedia.', {
            headers: { 'Content-Type': 'text/plain' },
          })
        )
      );
    })
  );
});

// Handle push notification
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('WebGIS Story', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
