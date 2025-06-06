"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Mic,
  MicOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Zap,
  Building,
  Clock,
  ListTodo,
  ShoppingCart,
  HelpCircle,
} from "lucide-react"
import { toast } from "sonner"
import { analyzeDashboardCommand, type DashboardCommand } from "@/lib/openai-modes"

export function DashboardVoiceControl() {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [parsedCommand, setParsedCommand] = useState<DashboardCommand | null>(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
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
      setParsedCommand(null)
      setIsListening(true)
      recognitionRef.current.start()
      toast.success("🎤 Dashboard-Sprachsteuerung aktiv!")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      if (transcript.trim()) {
        processCommand(transcript)
      }
    }
  }

  const processCommand = async (text: string) => {
    setIsProcessing(true)
    try {
      toast.loading("🧠 KI analysiert Dashboard-Befehl...")

      const command = await analyzeDashboardCommand(text)
      setParsedCommand(command)
      toast.success("✅ Befehl erkannt!")
    } catch (error) {
      console.error("Error processing command:", error)
      toast.error("❌ Fehler bei der Befehlsanalyse")
    } finally {
      setIsProcessing(false)
    }
  }

  const executeCommand = async () => {
    if (!parsedCommand) return

    try {
      toast.loading("⚡ Führe Befehl aus...")

      const response = await fetch("/api/execute-dashboard-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedCommand),
      })

      if (!response.ok) {
        throw new Error("Fehler beim Ausführen des Befehls")
      }

      const result = await response.json()
      toast.success("🎉 Befehl erfolgreich ausgeführt!")

      // Reset
      setTranscript("")
      setParsedCommand(null)

      // Seite neu laden für Updates
      window.location.reload()
    } catch (error) {
      console.error("Error executing command:", error)
      toast.error("❌ Fehler beim Ausführen")
    }
  }

  const getCommandIcon = (type: string) => {
    switch (type) {
      case "create_project":
        return <Building className="h-5 w-5" />
      case "add_worktime":
        return <Clock className="h-5 w-5" />
      case "create_task":
        return <ListTodo className="h-5 w-5" />
      case "create_material_order":
        return <ShoppingCart className="h-5 w-5" />
      default:
        return <Zap className="h-5 w-5" />
    }
  }

  const getCommandTitle = (type: string) => {
    switch (type) {
      case "create_project":
        return "Baustelle erstellen"
      case "add_worktime":
        return "Arbeitszeit hinzufügen"
      case "create_task":
        return "Aufgabe erstellen"
      case "create_material_order":
        return "Material bestellen"
      default:
        return "Unbekannter Befehl"
    }
  }

  if (!isSupported) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-700">Spracherkennung nicht verfügbar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Voice Control */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            Dashboard Sprachsteuerung
            <Badge className="bg-blue-100 text-blue-700">KI-Powered</Badge>
          </CardTitle>
          <CardDescription className="text-lg">
            Steuern Sie die komplette App mit Ihrer Stimme - Baustellen, Aufgaben, Arbeitszeiten!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Voice Button */}
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`${
                isListening
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              } text-white shadow-xl px-8 py-4 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-6 w-6 mr-3" />
                  Aufnahme stoppen
                </>
              ) : (
                <>
                  <Mic className="h-6 w-6 mr-3" />
                  Dashboard-Befehl sprechen
                </>
              )}
            </Button>

            {isListening && (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 font-semibold">🎤 Sprechen Sie Ihren Befehl...</span>
              </div>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
                <p className="text-lg">{transcript}</p>
              </div>
              <Button
                onClick={() => processCommand(transcript)}
                disabled={isProcessing}
                className="bg-green-500 hover:bg-green-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analysiere...
                  </>
                ) : (
                  "Befehl analysieren"
                )}
              </Button>
            </div>
          )}

          {/* Parsed Command */}
          {parsedCommand && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {getCommandIcon(parsedCommand.type)}
                  {getCommandTitle(parsedCommand.type)}
                  <Badge className="bg-green-100 text-green-700">
                    {Math.round(parsedCommand.confidence * 100)}% Konfidenz
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Project Info */}
                {parsedCommand.projectInfo && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Baustellen-Info:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {parsedCommand.projectInfo.name}
                      </div>
                      <div>
                        <span className="font-medium">Adresse:</span> {parsedCommand.projectInfo.address}
                      </div>
                      <div>
                        <span className="font-medium">Stadt:</span> {parsedCommand.projectInfo.city}
                      </div>
                      <div>
                        <Badge variant={parsedCommand.projectInfo.isExisting ? "default" : "secondary"}>
                          {parsedCommand.projectInfo.isExisting ? "Bestehend" : "Neu"}
                        </Badge>
                      </div>
                    </div>
                    {parsedCommand.projectInfo.description && (
                      <p className="text-sm text-gray-600">{parsedCommand.projectInfo.description}</p>
                    )}
                  </div>
                )}

                {/* Task Info */}
                {parsedCommand.taskInfo && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Aufgaben-Info:</h4>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Baustelle:</span> {parsedCommand.taskInfo.projectAddress}
                      </p>
                      <p>
                        <span className="font-medium">Aufgabe:</span> {parsedCommand.taskInfo.description}
                      </p>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            parsedCommand.taskInfo.priority === "urgent"
                              ? "destructive"
                              : parsedCommand.taskInfo.priority === "high"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {parsedCommand.taskInfo.priority === "urgent"
                            ? "🚨 Dringend"
                            : parsedCommand.taskInfo.priority === "high"
                              ? "🔥 Hoch"
                              : parsedCommand.taskInfo.priority === "medium"
                                ? "⚡ Mittel"
                                : "📝 Niedrig"}
                        </Badge>
                        <Badge variant="outline">
                          {parsedCommand.taskInfo.category === "urgent_material"
                            ? "🛒 Händler"
                            : parsedCommand.taskInfo.category === "material"
                              ? "📦 Material"
                              : "🔨 Arbeit"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Worktime Info */}
                {parsedCommand.worktimeInfo && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Arbeitszeit-Info:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Baustelle:</span> {parsedCommand.worktimeInfo.projectAddress}
                      </div>
                      <div>
                        <span className="font-medium">Datum:</span> {parsedCommand.worktimeInfo.date}
                      </div>
                      <div>
                        <span className="font-medium">Von:</span> {parsedCommand.worktimeInfo.startTime}
                      </div>
                      <div>
                        <span className="font-medium">Bis:</span> {parsedCommand.worktimeInfo.endTime}
                      </div>
                    </div>
                    {parsedCommand.worktimeInfo.breakMinutes && (
                      <p className="text-sm">
                        <span className="font-medium">Pause:</span> {parsedCommand.worktimeInfo.breakMinutes} Minuten
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Beschreibung:</span> {parsedCommand.worktimeInfo.description}
                    </p>
                  </div>
                )}

                <Button onClick={executeCommand} className="w-full bg-green-500 hover:bg-green-600 text-white">
                  <Zap className="h-4 w-4 mr-2" />
                  Befehl ausführen
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                  <span className="text-xl font-semibold text-blue-900">KI-Sprachbefehle Hilfe</span>
                </div>
                {isHelpOpen ? (
                  <ChevronUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Baustelle erstellen */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-blue-900">
                    <Building className="h-6 w-6" />
                    Baustelle erstellen
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500">
                      <p className="font-medium text-blue-800">Beispiel:</p>
                      <p className="text-gray-700 italic">
                        "Erstelle Baustelle für Herrn Müller in der Hauptstraße 15 in Hamburg. Dies ist eine neue
                        Baustelle. Dort haben wir Dacharbeiten durchzuführen."
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Erkannt wird:</strong> Kunde, Adresse, ob neu/bestehend, geplante Arbeiten
                      </p>
                    </div>
                  </div>
                </div>

                {/* Aufgabe erstellen */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-green-900">
                    <ListTodo className="h-6 w-6" />
                    Aufgabe erstellen
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-green-500">
                      <p className="font-medium text-green-800">Beispiel:</p>
                      <p className="text-gray-700 italic">
                        "Erstelle Aufgabe für Baustelle Schulze-Delitzsch-Straße: 3 Gerüst-Rahmen mitnehmen"
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Erkannt wird:</strong> Baustelle, Aufgabe, Priorität aus Kontext
                      </p>
                    </div>
                  </div>
                </div>

                {/* Arbeitszeit hinzufügen */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-purple-900">
                    <Clock className="h-6 w-6" />
                    Arbeitszeit hinzufügen
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500">
                      <p className="font-medium text-purple-800">Beispiel:</p>
                      <p className="text-gray-700 italic">
                        "Füge Arbeitszeit von 7:00 bis 13:30 zu Schulze-Delitzsch-Straße hinzu. Heute Dachrinne
                        repariert und 15 Minuten Pause gemacht."
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Erkannt wird:</strong> Zeiten, Baustelle, Tätigkeiten, Pausen
                      </p>
                    </div>
                  </div>
                </div>

                {/* Material bestellen */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-orange-900">
                    <ShoppingCart className="h-6 w-6" />
                    Material bestellen
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-orange-500">
                      <p className="font-medium text-orange-800">Beispiel:</p>
                      <p className="text-gray-700 italic">
                        "Für Baustelle Schulze-Delitzsch-Straße noch 3 Frankfurter Pfannen vom Händler besorgen"
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Erkannt wird:</strong> Material, Menge, Baustelle, Dringlichkeit
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipps */}
              <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                <h4 className="flex items-center gap-2 text-lg font-bold text-yellow-800 mb-4">
                  <Lightbulb className="h-5 w-5" />
                  Profi-Tipps für beste Erkennung:
                </h4>
                <ul className="space-y-2 text-yellow-700">
                  <li>• Sprechen Sie klar und deutlich</li>
                  <li>• Erwähnen Sie immer die Baustellen-Adresse</li>
                  <li>• Sagen Sie "neu" oder "bestehend" bei Baustellen</li>
                  <li>• Verwenden Sie "dringend" oder "wichtig" für Prioritäten</li>
                  <li>• Bei Materialien: "besorgen", "kaufen", "Händler" für Einkäufe</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
