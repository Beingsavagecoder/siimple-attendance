const CACHE = "attendance-v1";

const FILES = [
  "./",
  "./index.html",
  "./styles/style.css",
  "./js/script.js",
  "./manifest.json",
  "./icons/icon-192.jpg",
  "./icons/icon-512.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});