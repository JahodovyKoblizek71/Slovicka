const CACHE_NAME = 'v1_cache';
const ASSETS = [
  './',
  './index.html',
  './styly.css',
  './database.js',
  './aplikace.js',
  './ikona.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});