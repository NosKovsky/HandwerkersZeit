"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WifiOff, Wifi, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { useOfflineStorage } from "@/lib/offline-storage"
import { toast } from "sonner"

export function OfflineIndicator() {
  const { isOnline, syncData } = useOfflineStorage()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    checkPendingEntries()
  }, [])

  const checkPendingEntries = async () => {
    try {
      const { offlineStorage } = await import("@/lib/offline-storage")
      const unsyncedEntries = await offlineStorage.getUnsyncedEntries()
      setPendingCount(unsyncedEntries.length)
    } catch (error) {
      console.error("Error checking pending entries:", error)
    }
  }

  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Keine Internetverbindung verfügbar")
      return
    }

    setIsSyncing(true)
    try {
      const result = await syncData()

      if (result.success > 0) {
        toast.success(`${result.success} Einträge erfolgreich synchronisiert!`)
        setLastSync(new Date())
        setPendingCount(0)
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} Einträge konnten nicht synchronisiert werden`)
      }

      if (result.success === 0 && result.failed === 0) {
        toast.info("Alle Daten sind bereits synchronisiert")
      }
    } catch (error) {
      console.error("Sync error:", error)
      toast.error("Fehler bei der Synchronisation")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        !isOnline || pendingCount > 0 ? "shadow-lg" : "shadow-sm opacity-75"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Online/Offline Status */}
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
            <Badge variant={isOnline ? "default" : "destructive"}>{isOnline ? "Online" : "Offline"}</Badge>
          </div>

          {/* Pending Entries */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-700">{pendingCount} nicht synchronisiert</span>
            </div>
          )}

          {/* Sync Button */}
          {isOnline && pendingCount > 0 && (
            <Button size="sm" onClick={handleSync} disabled={isSyncing} className="bg-blue-500 hover:bg-blue-600">
              {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync
            </Button>
          )}

          {/* Last Sync */}
          {lastSync && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <CheckCircle className="h-3 w-3" />
              {lastSync.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>

        {/* Offline Mode Info */}
        {!isOnline && (
          <div className="mt-2 text-xs text-gray-600">
            <p>📱 Offline-Modus aktiv</p>
            <p>Ihre Daten werden lokal gespeichert und bei der nächsten Verbindung synchronisiert.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
