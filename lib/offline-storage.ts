"use client"

import { useEffect } from "react"

import { useState } from "react"

interface OfflineEntry {
  id: string
  type: "entry" | "receipt" | "material" | "task"
  data: any
  timestamp: number
  synced: boolean
}

class OfflineStorageManager {
  private dbName = "ai-work-tracker-offline"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Offline Einträge Store
        if (!db.objectStoreNames.contains("offline_entries")) {
          const store = db.createObjectStore("offline_entries", { keyPath: "id" })
          store.createIndex("type", "type", { unique: false })
          store.createIndex("timestamp", "timestamp", { unique: false })
          store.createIndex("synced", "synced", { unique: false })
        }

        // Cache Store für häufig verwendete Daten
        if (!db.objectStoreNames.contains("cache")) {
          const cacheStore = db.createObjectStore("cache", { keyPath: "key" })
          cacheStore.createIndex("expiry", "expiry", { unique: false })
        }
      }
    })
  }

  async saveOfflineEntry(type: OfflineEntry["type"], data: any): Promise<string> {
    if (!this.db) await this.init()

    const entry: OfflineEntry = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["offline_entries"], "readwrite")
      const store = transaction.objectStore("offline_entries")
      const request = store.add(entry)

      request.onsuccess = () => resolve(entry.id)
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedEntries(): Promise<OfflineEntry[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["offline_entries"], "readonly")
      const store = transaction.objectStore("offline_entries")
      const index = store.index("synced")
      const request = index.getAll(false)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["offline_entries"], "readwrite")
      const store = transaction.objectStore("offline_entries")
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const entry = getRequest.result
        if (entry) {
          entry.synced = true
          const putRequest = store.put(entry)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async cacheData(key: string, data: any, expiryMinutes = 60): Promise<void> {
    if (!this.db) await this.init()

    const cacheEntry = {
      key,
      data,
      expiry: Date.now() + expiryMinutes * 60 * 1000,
      timestamp: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cache"], "readwrite")
      const store = transaction.objectStore("cache")
      const request = store.put(cacheEntry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cache"], "readonly")
      const store = transaction.objectStore("cache")
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        if (result && result.expiry > Date.now()) {
          resolve(result.data)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async syncOfflineData(): Promise<{ success: number; failed: number }> {
    const unsyncedEntries = await this.getUnsyncedEntries()
    let success = 0
    let failed = 0

    for (const entry of unsyncedEntries) {
      try {
        await this.syncSingleEntry(entry)
        await this.markAsSynced(entry.id)
        success++
      } catch (error) {
        console.error("Sync failed for entry:", entry.id, error)
        failed++
      }
    }

    return { success, failed }
  }

  private async syncSingleEntry(entry: OfflineEntry): Promise<void> {
    const endpoint = this.getEndpointForType(entry.type)

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry.data),
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`)
    }
  }

  private getEndpointForType(type: OfflineEntry["type"]): string {
    switch (type) {
      case "entry":
        return "/api/entries"
      case "receipt":
        return "/api/receipts"
      case "material":
        return "/api/materials"
      case "task":
        return "/api/tasks"
      default:
        throw new Error(`Unknown entry type: ${type}`)
    }
  }
}

export const offlineStorage = new OfflineStorageManager()

// Hook für React Components
export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Automatisch synchronisieren wenn wieder online
      offlineStorage.syncOfflineData().then((result) => {
        if (result.success > 0) {
          console.log(`${result.success} Einträge erfolgreich synchronisiert`)
        }
      })
    }

    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return {
    isOnline,
    saveOffline: offlineStorage.saveOfflineEntry.bind(offlineStorage),
    syncData: offlineStorage.syncOfflineData.bind(offlineStorage),
    cacheData: offlineStorage.cacheData.bind(offlineStorage),
    getCachedData: offlineStorage.getCachedData.bind(offlineStorage),
  }
}
