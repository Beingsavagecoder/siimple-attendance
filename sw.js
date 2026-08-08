const CACHE = "attendance-v2";

const FILES = [
  "./",
  "./index.html",
  "./styles/style.css",
  "./js/scripts.js",
  "./manifest.json",
  "./icons/icon-192.jpg",
  "./icons/icon-512.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});