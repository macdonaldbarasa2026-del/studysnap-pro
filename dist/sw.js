const CACHE_VERSION = 'studysnap-pwa-v6';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;

// Critical App Shell files to pre-cache immediately
const CORE_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon.svg',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/apple-touch-icon.png',
  '/favicon-16.png',
  '/favicon-32.png',
  '/favicon-48.png',
  '/pwa-icon-maskable-192.png',
  '/pwa-icon-maskable-512.png'
];

// Install Event: Cache Core Shell Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CORE_SHELL_ASSETS).catch((err) => {
        console.warn('[PWA SW] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clear Old Caches and Take Control Immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!key.startsWith(CACHE_VERSION)) {
            console.log('[PWA SW] Removing legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Smart Offline Caching Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // 1. Navigation Requests (HTML / Page Loads) -> Network First with Offline App-Shell Fallback
  if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          // If network fails, serve cached index.html or root
          const cachedResponse = await caches.match(request) || await caches.match('/index.html') || await caches.match('/');
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8"><title>StudySnap Offline</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { background: #000; color: #fff; font-family: system-ui, sans-serif; display: flex; flex-direction: column; items-align: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }
                h1 { color: #38bdf8; margin-bottom: 8px; }
                p { color: #94a3b8; font-size: 14px; max-width: 400px; margin: 0 auto 20px auto; }
                button { background: #0284c7; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; }
              </style>
            </head>
            <body>
              <h1>StudySnap Offline Ready</h1>
              <p>You are currently offline. Cached study cards, baby piano, and local features are ready.</p>
              <button onclick="window.location.reload()">Retry Connection</button>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 2. Static Assets (Scripts, Styles, Fonts, Icons, SVG, Audio) -> Stale-While-Revalidate
  if (
    url.pathname.match(/\.(js|css|svg|png|jpg|jpeg|webp|woff|woff2|ttf|mp3|wav|ogg)$/) ||
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(ASSETS_CACHE).then((cache) => cache.put(request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Same-origin GET requests -> Network First with Dynamic Cache Fallback.
  // Never cache third-party APIs/auth responses in the generic PWA cache.
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background Message Listener (e.g. for update trigger)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
