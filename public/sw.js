// ── FOKUSKU SERVICE WORKER ───────────────────────────────────
// Handles scheduled notifications even when app is closed

const CACHE_NAME = 'fokusku-v1.1'
const ASSETS = ['/', '/index.html']

// ── Install ──────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

// ── Activate ─────────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch (offline support) ───────────────────────────────────
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request)).catch(() => caches.match('/index.html'))
  )
})

// ── Scheduled Notification Handler ───────────────────────────
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SCHEDULE_NOTIF') {
    const { id, title, body, delay } = e.data
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: id,
        requireInteraction: false,
        data: { url: '/' },
        actions: [
          { action: 'open',    title: '🎯 Buka FokusKu' },
          { action: 'dismiss', title: 'Nanti dulu'      },
        ]
      })
    }, delay)
  }

  if (e.data?.type === 'CANCEL_NOTIF') {
    self.registration.getNotifications({ tag: e.data.id })
      .then(notifs => notifs.forEach(n => n.close()))
  }
})

// ── Notification Click ────────────────────────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  if (e.action === 'dismiss') return

  e.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return clients.openWindow('/')
    })
  )
})
