"use client"

import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { toast } from "sonner"

export function QuickActions() {
  const handleEndWorkDay = () => {
    toast.success("Arbeitszeit beendet! 🏠")
    // Hier würde die Logik für das Beenden der Arbeitszeit implementiert
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleEndWorkDay} size="lg" className="w-full h-16 text-lg bg-red-500 hover:bg-red-600">
        <Clock className="h-6 w-6 mr-3" />
        Arbeitszeit beenden
      </Button>
    </div>
  )
}
