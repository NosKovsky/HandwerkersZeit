"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, MicOff, Loader2, CheckCircle, AlertCircle, Sparkles, Brain, MessageSquare, Lightbulb } from "lucide-react"
import { toast } from "sonner"

interface SpeechToTextEntryProps {
  onEntryCreated?: (entry: any) => void
}

interface ParsedEntry {
  activity: string
  notes: string
  materials: Array<{ name: string; quantity: number; unit: string }>
  duration?: string
  confidence: number
  suggestions?: string[]
}

export function SpeechToTextEntry({ onEntryCreated }: SpeechToTextEntryProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [parsedEntry, setParsedEntry] = useState<ParsedEntry | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "de-DE"

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }
          if (finalTranscript) {
            setTranscript((prev) => prev + " " + finalTranscript)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
          toast.error("Fehler bei der Spracherkennung: " + event.error)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      setTranscript("")
      setParsedEntry(null)
      setIsListening(true)
      recognitionRef.current.start()
      toast.success("🎤 Spracherkennung gestartet - sprechen Sie jetzt!")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      if (transcript.trim()) {
        processTranscript(transcript)
      }
    }
  }

  const processTranscript = async (text: string) => {
    setIsProcessing(true)
    try {
      toast.loading("🧠 KI analysiert Ihren Text...")

      const response = await fetch("/api/analyze-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: text }),
      })

      if (!response.ok) {
        throw new Error("Fehler bei der API-Anfrage")
      }

      const analysis: ParsedEntry = await response.json()
      setParsedEntry(analysis)
      toast.success("✨ Text erfolgreich von KI analysiert!")
    } catch (error) {
      console.error("Error processing transcript:", error)
      toast.error("❌ Fehler bei der KI-Analyse")
    } finally {
      setIsProcessing(false)
    }
  }

  const createEntry = () => {
    if (parsedEntry && onEntryCreated) {
      const entry = {
        activity: parsedEntry.activity,
        notes: parsedEntry.notes,
        materials_used: parsedEntry.materials,
        entry_date: new Date().toISOString().split("T")[0],
        entry_time: new Date().toTimeString().split(" ")[0].slice(0, 5),
      }
      onEntryCreated(entry)
      setTranscript("")
      setParsedEntry(null)
      toast.success("🎉 Eintrag erfolgreich erstellt!")
    }
  }

  if (!isSupported) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Spracherkennung nicht verfügbar</h3>
          <p className="text-gray-600 text-lg">
            Ihr Browser unterstützt keine Spracherkennung. Bitte verwenden Sie Chrome, Edge oder Safari.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Speech Input Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            KI-gestützte Spracheingabe
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Sprechen Sie Ihre Arbeiten - unsere KI analysiert automatisch Aktivitäten, Materialien und Zeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-8">
          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-6">
            <Button
              size="lg"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`${
                isListening
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-red-200"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-blue-200"
              } text-white shadow-2xl transform transition-all duration-300 hover:scale-105 px-8 py-4 text-lg font-semibold`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-6 w-6 mr-3" />
                  Aufnahme stoppen
                </>
              ) : (
                <>
                  <Mic className="h-6 w-6 mr-3" />
                  Aufnahme starten
                </>
              )}
            </Button>

            {isListening && (
              <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-200">
                <div className="relative">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-red-700 font-semibold text-lg">🎤 Hört zu...</span>
              </div>
            )}
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-800">Erkannter Text:</Label>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Ihr gesprochener Text erscheint hier..."
                className="min-h-32 bg-white border-2 border-gray-200 focus:border-blue-400 text-lg p-4 rounded-xl"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => processTranscript(transcript)}
                  disabled={isProcessing || !transcript.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      KI analysiert...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Mit KI analysieren
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setTranscript("")} size="lg">
                  Löschen
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parsed Results */}
      {parsedEntry && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              KI-Analyse Ergebnis
              <Badge
                variant="outline"
                className="ml-auto bg-green-100 text-green-700 border-green-300 px-4 py-2 text-lg font-semibold"
              >
                {Math.round(parsedEntry.confidence * 100)}% Konfidenz
              </Badge>
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Unsere KI hat Ihren Text analysiert und folgende Informationen extrahiert
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aktivität */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-800">Erkannte Aktivität:</Label>
                <Input
                  value={parsedEntry.activity}
                  readOnly
                  className="bg-white border-2 border-green-200 text-lg p-4 font-medium"
                />
              </div>

              {/* Dauer */}
              {parsedEntry.duration && (
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800">Erkannte Dauer:</Label>
                  <Input
                    value={parsedEntry.duration}
                    readOnly
                    className="bg-white border-2 border-green-200 text-lg p-4 font-medium"
                  />
                </div>
              )}
            </div>

            {/* Materialien */}
            {parsedEntry.materials.length > 0 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-800">Erkannte Materialien:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parsedEntry.materials.map((material, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-green-200 shadow-sm"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-lg text-gray-900">{material.name}</p>
                        <p className="text-gray-600 text-base">
                          {material.quantity} {material.unit}
                        </p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KI-Vorschläge */}
            {parsedEntry.suggestions && parsedEntry.suggestions.length > 0 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  KI-Verbesserungsvorschläge:
                </Label>
                <div className="space-y-2">
                  {parsedEntry.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                    >
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notizen */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-800">Vollständige Notizen:</Label>
              <Textarea
                value={parsedEntry.notes}
                readOnly
                className="bg-white border-2 border-green-200 min-h-24 text-lg p-4"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t-2 border-green-100">
              <Button
                onClick={createEntry}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg flex-1"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Eintrag erstellen
              </Button>
              <Button
                variant="outline"
                onClick={() => setParsedEntry(null)}
                size="lg"
                className="border-2 border-gray-300"
              >
                Bearbeiten
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-8">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Brain className="h-5 w-5 text-white" />
            </div>
            Tipps für optimale KI-Erkennung:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Sprechen Sie deutlich und in normalem Tempo</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Erwähnen Sie Materialien mit Mengen: "20 Ziegel", "5 Meter Dachrinne"</span>
              </li>
            </ul>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Beschreiben Sie die Tätigkeit: "Dach repariert", "Isolierung angebracht"</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Nennen Sie die Arbeitszeit: "3 Stunden gearbeitet"</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
