"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X } from "lucide-react"

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Prüfen, ob die App bereits installiert ist
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Prüfen, ob die App bereits installiert wurde (localStorage)
    const installed = localStorage.getItem("pwa-installed")
    if (installed === "true") {
      setIsInstalled(true)
      return
    }

    // Prüfen, ob der Prompt bereits abgelehnt wurde
    const promptDismissed = localStorage.getItem("pwa-prompt-dismissed")
    if (promptDismissed === "true") {
      setDismissed(true)
      return
    }

    // Event-Listener für den Install-Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Verhindern, dass der Browser seinen eigenen Dialog zeigt
      e.preventDefault()
      // Speichern des Events für späteren Gebrauch
      setDeferredPrompt(e)
      // Anzeigen unseres eigenen Prompts
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Aufräumen
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  // Funktion zum Installieren der App
  const installApp = async () => {
    if (!deferredPrompt) return

    // Browser-Prompt anzeigen
    deferredPrompt.prompt()

    // Warten auf die Entscheidung des Nutzers
    const { outcome } = await deferredPrompt.userChoice

    // Wenn der Nutzer die Installation akzeptiert hat
    if (outcome === "accepted") {
      console.log("App wurde installiert")
      localStorage.setItem("pwa-installed", "true")
      setIsInstalled(true)
    }

    // Das Event kann nur einmal verwendet werden
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  // Funktion zum Ablehnen der Installation
  const dismissPrompt = () => {
    localStorage.setItem("pwa-prompt-dismissed", "true")
    setDismissed(true)
    setShowPrompt(false)
  }

  if (!showPrompt || isInstalled || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-4 md:w-96">
      <Card className="border-0 shadow-xl bg-gradient-to-r from-orange-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg">HandwerkersZeit als App installieren</h3>
            <Button variant="ghost" size="icon" onClick={dismissPrompt} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Schließen</span>
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Installieren Sie HandwerkersZeit auf Ihrem Gerät für schnelleren Zugriff und Offline-Funktionalität.
          </p>
          <div className="flex gap-3">
            <Button onClick={installApp} className="bg-gradient-to-r from-orange-500 to-blue-500 text-white">
              <Download className="h-4 w-4 mr-2" />
              Jetzt installieren
            </Button>
            <Button variant="outline" onClick={dismissPrompt}>
              Später
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
