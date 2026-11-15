const STATIC_CACHE = 'nacesta-static-v1'
const API_CACHE = 'nacesta-api-v1'
const NAV_CACHE = 'nacesta-nav-v1'
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pwa/icon-192.png',
  '/pwa/icon-512.png',
  '/pwa/icon-maskable-512.png',
]

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys()
  if (keys.length > maxEntries) {
    await cache.delete(keys[0])
    await trimCache(cache, maxEntries)
  }
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) {
    cache.put(request, response.clone())
    trimCache(cache, maxEntries)
  }
  return response
}

async function networkFirst(request, cacheName, maxEntries, navigation = false) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
      trimCache(cache, maxEntries)
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) return cached

    if (navigation) {
      const shell = await cache.match('/index.html')
      if (shell) return shell
    }
    throw error
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => ![STATIC_CACHE, API_CACHE, NAV_CACHE].includes(key),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/api/notify')) return

  if (url.pathname.startsWith('/api/espn/')) {
    event.respondWith(networkFirst(request, API_CACHE, 20))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, NAV_CACHE, 10, true))
    return
  }

  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/pwa/') ||
    url.pathname === '/favicon.svg' ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 60))
  }
})
