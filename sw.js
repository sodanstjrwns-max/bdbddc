// Seoul BD Dental - Service Worker v1.0.0
// Strategy: Conservative caching for reliability
// - HTML: Network-first (always get latest content)
// - CSS/JS: Stale-while-revalidate (fast + fresh)
// - Images: Cache-first (long-lived assets)
// - Fonts: Cache-first (rarely change)

const CACHE_VERSION = 'seoul-bd-v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const FONT_CACHE = `fonts-${CACHE_VERSION}`;

// Pre-cache critical assets on install
const PRECACHE_ASSETS = [
  '/',
  '/css/site-v5.css',
  '/css/micro.css',
  '/js/main.js',
  '/js/micro.js',
  '/js/gnb-v2.js',
  '/images/icons/favicon.svg',
  '/manifest.json'
];

// Install: Pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        // Use addAll with catch to not fail on individual asset errors
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Failed to precache: ${url}`, err);
            })
          )
        );
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete any cache that doesn't match current version
              return name !== STATIC_CACHE && 
                     name !== IMAGE_CACHE && 
                     name !== FONT_CACHE;
            })
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch: Route-based caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Skip caching for API routes, admin, auth
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/admin/') || 
      url.pathname.startsWith('/auth/')) {
    return;
  }

  // Route to appropriate strategy
  if (isImageRequest(url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 365 * 24 * 60 * 60));
  } else if (isFontRequest(url)) {
    event.respondWith(cacheFirst(request, FONT_CACHE, 365 * 24 * 60 * 60));
  } else if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  } else if (isHTMLRequest(request, url)) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
  }
  // Let other requests pass through to network
});

// === Strategy Implementations ===

// Network-first: Try network, fall back to cache (for HTML)
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // If offline and no cache, return offline page
    return caches.match('/') || new Response('오프라인 상태입니다.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// Cache-first: Try cache, fall back to network (for images, fonts)
async function cacheFirst(request, cacheName, maxAge) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 408 });
  }
}

// Stale-while-revalidate: Return cache immediately, update in background (for CSS/JS)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const networkFetch = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || networkFetch;
}

// === Request Type Detection ===

function isImageRequest(url) {
  return url.pathname.match(/\.(jpg|jpeg|webp|png|svg|gif|ico)(\?.*)?$/i) ||
         url.pathname.startsWith('/images/');
}

function isFontRequest(url) {
  return url.pathname.match(/\.(woff2?|ttf|otf|eot)(\?.*)?$/i);
}

function isStaticAsset(url) {
  return url.pathname.match(/\.(css|js)(\?.*)?$/i);
}

function isHTMLRequest(request, url) {
  const acceptHeader = request.headers.get('Accept') || '';
  return acceptHeader.includes('text/html') || 
         url.pathname.endsWith('.html') ||
         url.pathname === '/' ||
         (!url.pathname.includes('.'));
}
