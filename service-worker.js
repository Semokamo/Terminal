const CACHE_NAME = 'terminal-echoes-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx', // Assuming this is the entry point URL for your main JS
  '/manifest.json',
  // App assets
  'https://wallpapers.com/images/hd/hacking-background-bryw246r4lx5pyue.jpg',
  // Icons (ensure these paths match what you create and what's in manifest.json)
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png', // For Apple devices
  // CDNs and external resources from importmap and index.html
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@400;700&display=swap',
  // esm.sh dependencies (cache.addAll will fetch the resolved versions)
  'https://esm.sh/@google/genai@^1.0.1',
  // For react & react-dom, esm.sh might serve multiple files or redirect.
  // Listing the specific resolved files is most robust, but addAll often handles it.
  // Let's assume these are the primary entry points from the import map:
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom/client', // react-dom/client is often imported
  // It's good practice to also cache font files from fonts.gstatic.com if possible,
  // but they are often numerous and have opaque URLs.
  // The browser cache + caching the googleapis CSS often works well.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // AddAll will fetch and cache all specified URLs.
        // If any fetch fails, the entire install step fails.
        return cache.addAll(URLS_TO_CACHE.map(url => new Request(url, { mode: 'cors' })))
          .catch(error => {
            console.error('Failed to cache one or more URLs during install:', error, URLS_TO_CACHE);
            // Attempt to cache essential files individually to see which one fails.
            URLS_TO_CACHE.forEach(url => {
              fetch(new Request(url, { mode: 'cors' })).then(response => {
                if (!response.ok) {
                  console.error('Failed to fetch (and thus cache) during install:', url, response.status);
                }
              }).catch(fetchError => {
                console.error('Network error for (and thus cache) during install:', url, fetchError);
              });
            });
          });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response and if it's something we want to cache
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse; // Return error response or non-200 response
            }

            // We only want to cache GET requests, and from specific origins (our app, CDNs)
            if (event.request.method === 'GET' && isCacheableAsset(event.request.url)) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }
        ).catch(error => {
          console.warn('SW: Network request failed for:', event.request.url, error);
          // Optionally, return a custom offline fallback page/response here if appropriate
          // For example, if it's an image request and you have a placeholder:
          // if (event.request.destination === 'image') {
          //   return caches.match('/offline-placeholder.png');
          // }
        });
      })
  );
});

function isCacheableAsset(urlString) {
  try {
    const url = new URL(urlString);
    // Define origins that are safe to cache GET requests from
    const cacheableOrigins = [
      self.location.origin, // Your app's origin
      'https://cdn.tailwindcss.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://esm.sh',
      'https://wallpapers.com' // For the background image
    ];

    if (!cacheableOrigins.includes(url.origin)) {
      return false; // Don't cache from other origins unless explicitly listed
    }

    // Add any other specific path patterns to exclude if needed
    // e.g., if (url.pathname.startsWith('/api/')) return false;

    return true;
  } catch (e) {
    // Invalid URL string
    return false;
  }
}
