self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request).catch(() => new Response("Offline"))
  );
});
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("hw-v1").then(c =>
      c.addAll(["./", "index.html", "style.css", "app.js"])
    )
  );
});
