"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Camera, Mic, Zap, CheckCircle, ArrowRight, Truck } from "lucide-react"
import { toast } from "sonner"

export function QuickActions() {
  const [isRecording, setIsRecording] = useState(false)
  const [isDeliveryRecording, setIsDeliveryRecording] = useState(false)

  const quickPhoto = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        toast.success("Foto wird automatisch zugeordnet 📸")
      })
    }
  }

  const voiceNote = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      toast.success("Sprachnotiz läuft... 🎤")
    } else {
      toast.success("Notiz gespeichert und automatisch zugeordnet! ✅")
    }
  }

  const deliveryVoiceNote = async () => {
    setIsDeliveryRecording(!isDeliveryRecording)
    if (!isDeliveryRecording) {
      toast.success("Lieferung wird aufgenommen... 🚚")
      // Hier würde die Spracherkennung starten
    } else {
      // Beispiel-Verarbeitung der Spracheingabe
      const exampleDelivery = {
        items: [
          { name: "Dachrinne 6tlg", quantity: 10, unit: "Stück", meters_per_piece: 3 },
          { name: "Rinneisen 6tlg", quantity: 60, unit: "Stück" },
        ],
      }

      try {
        await fetch("/api/process-delivery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(exampleDelivery),
        })
        toast.success("Lieferung automatisch zum Bestand hinzugefügt! ✅")
      } catch (error) {
        toast.error("Fehler beim Verarbeiten der Lieferung")
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Schnellaktionen */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={quickPhoto} className="h-20 flex-col bg-blue-500 hover:bg-blue-600">
              <Camera className="h-6 w-6 mb-2" />
              Schnellfoto
            </Button>

            <Button
              onClick={voiceNote}
              className={`h-20 flex-col ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-purple-500 hover:bg-purple-600"}`}
            >
              <Mic className="h-6 w-6 mb-2" />
              {isRecording ? "Stopp" : "Sprachnotiz"}
            </Button>

            <Button className="h-20 flex-col bg-orange-500 hover:bg-orange-600">
              <Package className="h-6 w-6 mb-2" />
              Material scannen
            </Button>

            <Button className="h-20 flex-col bg-green-500 hover:bg-green-600">
              <CheckCircle className="h-6 w-6 mb-2" />
              Feierabend
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lieferungen per Sprache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-500" />
            Material-Lieferungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={deliveryVoiceNote}
              className={`w-full h-16 flex items-center justify-center gap-3 ${
                isDeliveryRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              <Truck className="h-6 w-6" />
              {isDeliveryRecording ? "Lieferung beenden" : "Lieferung per Sprache erfassen"}
              <Mic className="h-5 w-5" />
            </Button>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-2">Beispiel-Spracheingabe:</p>
              <p className="italic">
                "Heute sind angeliefert worden: 30 Meter Dachrinne 6-teilig und 60 Rinneisen 6-teilig"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material-Warnungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Material-Warnungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Material nachbestellen</p>
                <p className="text-sm text-gray-500">Dachziegel werden knapp (nur noch 50 Stück)</p>
              </div>
              <Button size="sm" variant="outline">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium">Bestand kritisch</p>
                <p className="text-sm text-gray-500">Dachlatten sind aufgebraucht!</p>
              </div>
              <Button size="sm" variant="outline">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
