"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Mic,
  MicOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Brain,
  MessageSquare,
  Lightbulb,
  User,
  Package,
  ListTodo,
  Clock,
  Zap,
  Wand2,
} from "lucide-react"
import { toast } from "sonner"
import { createEntry } from "@/app/entries/actions"
import type { AdvancedParsedEntry } from "@/lib/openai-advanced"

interface UltimateSpeechEntryProps {
  onEntryCreated?: (entry: any) => void
}

export function UltimateSpeechEntry({ onEntryCreated }: UltimateSpeechEntryProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [parsedEntry, setParsedEntry] = useState<
    (AdvancedParsedEntry & { customerId?: string; projectId?: string }) | null
  >(null)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
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
      toast.success("🎤 Ultimative KI-Spracherkennung gestartet!")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      if (transcript.trim()) {
        processAdvancedTranscript(transcript)
      }
    }
  }

  const processAdvancedTranscript = async (text: string) => {
    setIsProcessing(true)
    try {
      toast.loading("🧠 KI analysiert ALLES - Kunde, Baustelle, Materialien, Aufgaben...")

      const response = await fetch("/api/analyze-advanced-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: text }),
      })

      if (!response.ok) {
        throw new Error("Fehler bei der API-Anfrage")
      }

      const analysis = await response.json()
      setParsedEntry(analysis)
      toast.success("🚀 Ultimative KI-Analyse abgeschlossen!")
    } catch (error) {
      console.error("Error processing transcript:", error)
      toast.error("❌ Fehler bei der KI-Analyse")
    } finally {
      setIsProcessing(false)
    }
  }

  const createCompleteEntry = async () => {
    if (!parsedEntry) return

    try {
      toast.loading("🔄 Erstelle Eintrag, Kunde, Baustelle und Aufgaben...")

      // Eintrag erstellen
      const entryResult = await createEntry({
        activity: parsedEntry.activity,
        notes: parsedEntry.notes,
        entry_date: parsedEntry.date,
        entry_time: parsedEntry.startTime,
        end_time: parsedEntry.endTime,
        project_id: parsedEntry.projectId || null,
        materials_used: parsedEntry.materials.filter((m) => m.category === "used"),
      })

      if (entryResult.success) {
        // Aufgaben für benötigte Materialien erstellen
        if (parsedEntry.tasks.length > 0 && parsedEntry.projectId) {
          for (const task of parsedEntry.tasks) {
            try {
              await fetch("/api/create-project-todo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  projectId: parsedEntry.projectId,
                  content: task.description,
                  priority: task.priority,
                }),
              })
            } catch (error) {
              console.error("Error creating task:", error)
            }
          }
        }

        if (onEntryCreated) {
          onEntryCreated(entryResult.entry)
        }

        setTranscript("")
        setParsedEntry(null)
        toast.success("🎉 ALLES erfolgreich erstellt - Eintrag, Kunde, Baustelle und Aufgaben!")
      } else {
        toast.error("❌ Fehler beim Erstellen: " + entryResult.error)
      }
    } catch (error) {
      console.error("Error creating complete entry:", error)
      toast.error("❌ Unerwarteter Fehler")
    }
  }

  if (!isSupported) {
    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-red-50 to-orange-50">
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
      {/* Ultimate Speech Input Card */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Wand2 className="h-3 w-3 mr-1" />
            Ultimate KI
          </Badge>
        </div>

        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3 text-3xl">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            Ultimate KI-Sprachsteuerung
          </CardTitle>
          <CardDescription className="text-xl text-gray-600">
            Sprechen Sie ALLES - Kunde, Baustelle, Arbeiten, Materialien, Aufgaben. Die KI macht den Rest! 🚀
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-8">
          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-8">
            <Button
              size="lg"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`${
                isListening
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-red-300"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-300"
              } text-white shadow-2xl transform transition-all duration-300 hover:scale-110 px-12 py-6 text-xl font-bold rounded-2xl`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-8 w-8 mr-4" />
                  Aufnahme stoppen
                </>
              ) : (
                <>
                  <Mic className="h-8 w-8 mr-4" />
                  Ultimate Aufnahme starten
                </>
              )}
            </Button>

            {isListening && (
              <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
                <div className="relative">
                  <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-red-700 font-bold text-2xl">🎤 KI hört ALLES...</span>
              </div>
            )}
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="space-y-6">
              <Label className="text-2xl font-bold text-gray-800">Erkannter Text:</Label>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Ihr gesprochener Text erscheint hier..."
                className="min-h-40 bg-white border-4 border-purple-200 focus:border-purple-400 text-xl p-6 rounded-2xl"
              />
              <div className="flex gap-4">
                <Button
                  onClick={() => processAdvancedTranscript(transcript)}
                  disabled={isProcessing || !transcript.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-xl"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                      Ultimate KI analysiert...
                    </>
                  ) : (
                    <>
                      <Zap className="h-6 w-6 mr-3" />
                      Ultimate KI-Analyse starten
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setTranscript("")} size="lg" className="border-4">
                  Löschen
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ultimate Results */}
      {parsedEntry && (
        <div className="space-y-8">
          {/* Kunde & Baustelle */}
          {parsedEntry.customer && (
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-white to-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  Kunde & Baustelle erkannt
                  <Badge className="bg-blue-100 text-blue-700">
                    {parsedEntry.customerId ? "Gefunden" : "Neu erstellt"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-lg font-semibold">Kunde:</Label>
                    <Input value={parsedEntry.customer.name} readOnly className="bg-white text-lg p-4" />
                  </div>
                  <div>
                    <Label className="text-lg font-semibold">Adresse:</Label>
                    <Input
                      value={`${parsedEntry.customer.address.street}, ${parsedEntry.customer.address.zipCode || ""} ${parsedEntry.customer.address.city}`}
                      readOnly
                      className="bg-white text-lg p-4"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Arbeitszeit */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                Arbeitszeit erkannt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-lg font-semibold">Datum:</Label>
                  <Input value={parsedEntry.date} readOnly className="bg-white text-lg p-4" />
                </div>
                <div>
                  <Label className="text-lg font-semibold">Von:</Label>
                  <Input value={parsedEntry.startTime} readOnly className="bg-white text-lg p-4" />
                </div>
                <div>
                  <Label className="text-lg font-semibold">Bis:</Label>
                  <Input value={parsedEntry.endTime} readOnly className="bg-white text-lg p-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materialien */}
          {parsedEntry.materials.length > 0 && (
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-orange-50 via-white to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  Materialien erkannt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-lg font-semibold text-green-700 mb-3 block">✅ Verwendet:</Label>
                    <div className="space-y-3">
                      {parsedEntry.materials
                        .filter((m) => m.category === "used")
                        .map((material, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border-2 border-green-200"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-lg">{material.name}</p>
                              <p className="text-gray-600">
                                {material.quantity} {material.unit}
                              </p>
                            </div>
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-lg font-semibold text-orange-700 mb-3 block">🛒 Benötigt:</Label>
                    <div className="space-y-3">
                      {parsedEntry.materials
                        .filter((m) => m.category === "needed")
                        .map((material, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border-2 border-orange-200"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-lg">{material.name}</p>
                              <p className="text-gray-600">
                                {material.quantity} {material.unit}
                              </p>
                            </div>
                            <AlertCircle className="h-6 w-6 text-orange-500" />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aufgaben */}
          {parsedEntry.tasks.length > 0 && (
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                    <ListTodo className="h-6 w-6 text-white" />
                  </div>
                  Aufgaben erkannt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parsedEntry.tasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-200"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{task.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "destructive"
                                : task.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {task.priority === "high"
                              ? "🔥 Hoch"
                              : task.priority === "medium"
                                ? "⚡ Mittel"
                                : "📝 Niedrig"}
                          </Badge>
                          {task.dueDate && <Badge variant="outline">📅 {task.dueDate}</Badge>}
                        </div>
                      </div>
                      <ListTodo className="h-6 w-6 text-purple-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aktivität & Notizen */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-gray-50 via-white to-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                Tätigkeit & Details
                <Badge className="bg-green-100 text-green-700 text-lg px-4 py-2">
                  {Math.round(parsedEntry.confidence * 100)}% Konfidenz
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-lg font-semibold">Haupttätigkeit:</Label>
                <Input value={parsedEntry.activity} readOnly className="bg-white text-lg p-4 font-medium" />
              </div>
              <div>
                <Label className="text-lg font-semibold">Vollständige Notizen:</Label>
                <Textarea value={parsedEntry.notes} readOnly className="bg-white min-h-32 text-lg p-4" />
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="p-8 text-center">
              <Button
                onClick={createCompleteEntry}
                className="bg-white text-green-600 hover:bg-gray-100 font-bold px-16 py-6 text-2xl shadow-2xl hover:shadow-white/50 transition-all duration-300 group rounded-2xl"
                size="lg"
              >
                <Sparkles className="mr-4 h-8 w-8" />
                ALLES ERSTELLEN - Eintrag, Kunde, Baustelle & Aufgaben
                <CheckCircle className="ml-4 h-8 w-8 group-hover:scale-110 transition-transform" />
              </Button>
              <p className="text-green-100 text-lg mt-6 font-medium">
                ✨ Ein Klick erstellt automatisch: Zeiterfassung + Kunde + Baustelle + Materialien + Aufgaben ✨
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Help Card */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-8">
          <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            Beispiel für Ultimate KI-Sprachsteuerung:
          </h3>
          <div className="bg-white p-6 rounded-2xl border-2 border-blue-200">
            <p className="text-lg text-gray-700 italic leading-relaxed">
              "Heute gearbeitet von 7.00 bis jetzt bei Herrn Schulze in der Schulze-Delitzsch-Straße in Herford. Wir
              haben dort Reparatur einer Dachrinne gemacht. Dafür haben wir gebraucht: 1 Stück 6-teilige Rinne 3 Meter,
              4 Rinneisen 6-teilig, Lötmaterial. Es ist noch zu besorgen: 1 Einhangstutzen und 4 Rinneisen müssen beim
              Händler geholt werden."
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p className="font-semibold text-blue-600">🎯 Die KI erkennt automatisch:</p>
              <ul className="space-y-1 ml-4">
                <li>• Kunde: "Herr Schulze"</li>
                <li>• Adresse mit PLZ-Ermittlung</li>
                <li>• Arbeitszeiten: "von 7.00 bis jetzt"</li>
                <li>• Tätigkeit: "Reparatur einer Dachrinne"</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-green-600">🚀 Und erstellt automatisch:</p>
              <ul className="space-y-1 ml-4">
                <li>• Verwendete Materialien</li>
                <li>• Benötigte Materialien als Aufgaben</li>
                <li>• Neue Baustelle falls nicht vorhanden</li>
                <li>• Zeiterfassung mit allen Details</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
