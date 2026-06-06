const CACHE_NAME = "erina-rsa-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/booking",
  "/contact",
  "/about",
  "/my-bookings",
  "/logo-icon.png",
  "/logo-full.png",
  "/icon-192.png",
  "/icon-512.png",
  "/facebook.png",
  "/whatsapp.png",
  "/linkedin.png"
];

// Install Event - Pre-cache Core Assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching core assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean Up Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing legacy cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve Cached Assets with Stale-While-Revalidate Strategy
self.addEventListener("fetch", (event) => {
  const reqUrl = new URL(event.request.url);

  // Bypass service worker caching for dynamic API calls or third-party tracking scripts
  if (reqUrl.pathname.startsWith("/api/") || reqUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch new version in the background to update the cache silently
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            /* ignore background update errors */
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          
          // Cache the fetched page dynamically
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and request is an HTML page navigation, return root home/booking shell
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
    })
  );
});
