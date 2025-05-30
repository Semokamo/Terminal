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
        console.log('SW Install: Opened cache', CACHE_NAME);
        // AddAll will fetch and cache all specified URLs.
        // If any fetch fails, the entire install step fails.
        return cache.addAll(URLS_TO_CACHE.map(url => new Request(url, { mode: 'cors' })))
          .then(() => {
            console.log('SW Install: All URLs in URLS_TO_CACHE successfully cached.');
          })
          .catch(error => {
            console.error('SW Install: Caching failed for one or more URLs during cache.addAll(). See details below.', error);
            // Attempt to fetch and log status for each URL individually to pinpoint the failure.
            URLS_TO_CACHE.forEach(url => {
              fetch(new Request(url, { mode: 'cors' }))
                .then(response => {
                  if (!response.ok) {
                    console.error(`SW Install (Detail): Failed to fetch ${url}. Status: ${response.status} ${response.statusText}`);
                  } else {
                    // console.log(`SW Install (Detail): Successfully fetched ${url} (status ${response.status}), but it might have failed in cache.addAll if part of a batch.`);
                  }
                })
                .catch(fetchError => {
                  console.error(`SW Install (Detail): Network error for ${url}. Error:`, fetchError);
                });
            });
            // IMPORTANT: Propagate the error to ensure the install fails if addAll failed.
            throw error;
          });
      })
      .then(() => self.skipWaiting()) // Force the new service worker to activate immediately
      .catch(err => {
        console.error('SW Install: Caching setup failed entirely.', err);
         // Ensure the install fails if any step above throws
        throw err;
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
            console.log('SW Activate: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW Activate: Activated and claimed clients.');
      return self.clients.claim(); // Ensure the SW takes control of all clients immediately
    })
  );
});

self.addEventListener('fetch', event => {
  // console.log('SW Fetching:', event.request.url); // Uncomment for debugging fetch events
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          // console.log('SW Fetch: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Not in cache - fetch from network
        // console.log('SW Fetch: Not in cache, fetching from network:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response and if it's something we want to cache
            // Only cache successful GET requests from cacheable origins.
            // Responses from `no-cors` requests (type 'opaque') have status 0 and cannot be inspected or reliably cached.
            if (
              !networkResponse || 
              networkResponse.status !== 200 || // For non-opaque responses
              event.request.method !== 'GET' ||
              !isCacheableAsset(event.request.url)
            ) {
              if (networkResponse && networkResponse.type === 'opaque') {
                // console.log('SW Fetch: Opaque response from network, not caching:', event.request.url);
              } else if (networkResponse && networkResponse.status !== 200) {
                // console.log('SW Fetch: Non-200 response from network, not caching:', event.request.url, networkResponse.status);
              }
              return networkResponse; 
            }
            
            // console.log('SW Fetch: Caching new network response for:', event.request.url);
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          }
        ).catch(error => {
          console.warn('SW Fetch: Network request failed for:', event.request.url, error);
          // Optionally, return a custom offline fallback page/response here if appropriate
          // For example, if it's an image request and you have a placeholder:
          // if (event.request.destination === 'image') {
          //   return caches.match('/offline-placeholder.png');
          // }
          // For a more robust offline experience, you might want to return a generic offline page
          // if (event.request.mode === 'navigate') {
          //   return caches.match('/offline.html'); // You would need to create and cache an offline.html
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
      'https://fonts.gstatic.com', // Font files are served from here
      'https://esm.sh',
      'https://wallpapers.com' // For the background image
    ];

    if (!cacheableOrigins.includes(url.origin)) {
      // console.log('SW isCacheableAsset: false (origin not cacheable)', url.origin);
      return false; 
    }

    // Add any other specific path patterns to exclude if needed
    // e.g., if (url.pathname.startsWith('/api/')) return false;
    // console.log('SW isCacheableAsset: true', urlString);
    return true;
  } catch (e) {
    // Invalid URL string
    // console.warn('SW isCacheableAsset: false (invalid URL)', urlString);
    return false;
  }
}
