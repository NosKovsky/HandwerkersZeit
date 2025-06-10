"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { DashboardCommand } from "@/lib/openai-modes"
import type SpeechRecognition from "speech-recognition"

export function DashboardVoiceControl() {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [lastCommand, setLastCommand] = useState<DashboardCommand | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Spracherkennung wird von diesem Browser nicht unterstützt")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "de-DE"

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
      toast.info("🎤 Sprechen Sie jetzt...")
    }

    recognition.onresult = async (event) => {
      const spokenText = event.results[0][0].transcript
      setTranscript(spokenText)
      setIsListening(false)
      setIsProcessing(true)

      try {
        // API Call zur Analyse des Sprachbefehls
        const response = await fetch("/api/analyze-dashboard-command", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcript: spokenText }),
        })

        const command: DashboardCommand = await response.json()
        setLastCommand(command)

        if (command.confidence > 0.7) {
          toast.success(`✅ Befehl erkannt: ${command.type}`)
          // Hier würde die entsprechende Aktion ausgeführt
        } else {
          toast.warning("⚠️ Befehl nicht eindeutig erkannt")
        }
      } catch (error) {
        console.error("Error analyzing command:", error)
        toast.error("Fehler bei der Sprachanalyse")
      } finally {
        setIsProcessing(false)
      }
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      setIsProcessing(false)
      toast.error(`Spracherkennungsfehler: ${event.error}`)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          size="lg"
          className={`h-16 px-8 ${
            isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 mr-2 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-6 w-6 mr-2" />
          ) : (
            <Mic className="h-6 w-6 mr-2" />
          )}
          {isProcessing ? "Verarbeite..." : isListening ? "Aufnahme stoppen" : "Sprachbefehl starten"}
        </Button>
      </div>

      {transcript && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Mic className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Erkannter Text:</p>
                <p className="text-sm text-muted-foreground">{transcript}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {lastCommand && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              {lastCommand.confidence > 0.7 ? (
                <CheckCircle className="h-4 w-4 mt-1 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-1 text-yellow-500" />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <p className="text-sm font-medium">Erkannter Befehl:</p>
                  <Badge variant={lastCommand.confidence > 0.7 ? "default" : "secondary"}>
                    {Math.round(lastCommand.confidence * 100)}% Sicherheit
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground capitalize">{lastCommand.type.replace("_", " ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Beispiele: "Erstelle neue Baustelle", "Füge Arbeitszeit hinzu", "Erstelle Aufgabe"
        </p>
      </div>
    </div>
  )
}
