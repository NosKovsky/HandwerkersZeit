// Service Worker für HandwerkersZeit PWA
const CACHE_NAME = "handwerkerszeit-v1"

// Dateien, die im Cache gespeichert werden sollen
const urlsToCache = [
  "/",
  "/dashboard",
  "/baustellen",
  "/zeiterfassung",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// Installation des Service Workers
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache geöffnet")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Aktivierung des Service Workers
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Fetch-Event: Versuche zuerst aus dem Cache zu laden, dann vom Netzwerk
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }
      return fetch(event.request).then((response) => {
        // Prüfe, ob wir eine gültige Antwort erhalten haben
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // WICHTIG: Response klonen, da sie nur einmal verwendet werden kann
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

// Synchronisierung im Hintergrund für offline-Aktionen
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-entries") {
    event.waitUntil(syncEntries())
  }
})

// Funktion zum Synchronisieren von Einträgen
async function syncEntries() {
  // Hier würde die Logik zum Synchronisieren von offline erstellten Einträgen stehen
  console.log("Synchronisiere offline-Einträge")
}
