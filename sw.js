// MTG Collection Tracker Service Worker
const CACHE_NAME = 'mtg-tracker-v1.0.0';
const STATIC_CACHE_NAME = 'mtg-tracker-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'mtg-tracker-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/price-tracker.js',
  '/manifest.json',
  '/offline.html',
  // Font Awesome (cached from CDN)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.scryfall\.com\/cards\//,
  /^https:\/\/api\.scryfall\.com\/sets/,
  /^https:\/\/cards\.scryfall\.io\//
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error caching static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with appropriate caching strategies
  if (isStaticFile(request.url)) {
    // Cache First strategy for static files
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request.url)) {
    // Network First strategy for API requests
    event.respondWith(networkFirst(request));
  } else if (isImageRequest(request.url)) {
    // Stale While Revalidate for images
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Default: try network first, fallback to cache
    event.respondWith(networkFirst(request));
  }
});

// Cache First Strategy - for static files
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    return await caches.match('/offline.html');
  }
}

// Network First Strategy - for API requests and dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      // Only cache successful API responses
      if (isAPIRequest(request.url)) {
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If it's a navigation request and no cache, show offline page
    if (request.mode === 'navigate') {
      return await caches.match('/offline.html');
    }

    // For other requests, return a basic offline response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Stale While Revalidate Strategy - for images
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || await fetchPromise;
}

// Helper functions
function isStaticFile(url) {
  return STATIC_FILES.some(file => url.includes(file)) ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.includes('.html') ||
         url.includes('font-awesome');
}

function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

function isImageRequest(url) {
  return url.includes('cards.scryfall.io') ||
         url.includes('.jpg') ||
         url.includes('.png') ||
         url.includes('.webp') ||
         url.includes('.gif');
}

// Background Sync for offline actions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-cards') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions when connection is restored
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB or localStorage
    const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]');
    
    for (const action of offlineActions) {
      try {
        // Process each offline action
        await processOfflineAction(action);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
    
    // Clear processed actions
    localStorage.removeItem('offlineActions');
    console.log('Service Worker: Offline actions synced successfully');
  } catch (error) {
    console.error('Service Worker: Error syncing offline actions:', error);
  }
}

async function processOfflineAction(action) {
  switch (action.type) {
    case 'ADD_CARD':
      // Re-fetch card data and update collection
      console.log('Syncing offline card addition:', action.data);
      break;
    case 'UPDATE_PRICES':
      // Refresh price data
      console.log('Syncing price updates');
      break;
    default:
      console.log('Unknown offline action type:', action.type);
  }
}

// Push notification handling (for future price alerts)
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'MTG Collection Tracker notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Collection',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MTG Tracker', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main app
self.addEventListener('message', event => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    default:
      console.log('Service Worker: Unknown message type:', type);
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('Service Worker: All caches cleared');
}

// Periodic background sync for price updates (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'price-update') {
    event.waitUntil(updatePricesInBackground());
  }
});

async function updatePricesInBackground() {
  try {
    console.log('Service Worker: Updating prices in background');
    // This would integrate with your price tracking system
    // For now, just log that it would happen
  } catch (error) {
    console.error('Service Worker: Error updating prices in background:', error);
  }
}
