"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Mic, MicOff, Loader2, ChevronDown, ChevronUp, MessageSquare, Lightbulb } from "lucide-react"
import { toast } from "sonner"
import { analyzeTimeEntryCommand } from "@/lib/openai-modes"

interface SimpleVoiceNotesProps {
  onNotesUpdate: (notes: string, materials?: any[]) => void
  currentNotes?: string
}

export function SimpleVoiceNotes({ onNotesUpdate, currentNotes = "" }: SimpleVoiceNotesProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
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
          toast.error("Fehler bei der Spracherkennung")
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
      setIsListening(true)
      recognitionRef.current.start()
      toast.success("🎤 Sprachnotiz wird aufgenommen...")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      if (transcript.trim()) {
        processVoiceNote(transcript)
      }
    }
  }

  const processVoiceNote = async (text: string) => {
    setIsProcessing(true)
    try {
      const command = await analyzeTimeEntryCommand(text)

      // Notizen mit vorhandenen kombinieren
      const combinedNotes = currentNotes ? `${currentNotes}\n\n${command.notes}` : command.notes

      onNotesUpdate(combinedNotes, command.materials)
      setTranscript("")
      toast.success("✅ Sprachnotiz hinzugefügt!")
    } catch (error) {
      console.error("Error processing voice note:", error)
      // Fallback: Einfach den Text hinzufügen
      const combinedNotes = currentNotes ? `${currentNotes}\n\n${text}` : text
      onNotesUpdate(combinedNotes)
      setTranscript("")
      toast.success("✅ Sprachnotiz hinzugefügt!")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Voice Notes Card */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Sprachnotizen für Zeiterfassung
          </CardTitle>
          <CardDescription>
            Sprechen Sie einfach Ihre Arbeiten und Materialien - wird automatisch zu den Notizen hinzugefügt
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`${
                isListening ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stoppen
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Sprachnotiz
                </>
              )}
            </Button>

            {isProcessing && (
              <div className="flex items-center gap-2 text-green-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Verarbeite...</span>
              </div>
            )}
          </div>

          {isListening && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-700 text-sm font-medium">🎤 Sprechen Sie Ihre Arbeiten...</span>
            </div>
          )}

          {transcript && (
            <div className="space-y-3">
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Ihre Sprachnotiz..."
                className="min-h-20 bg-white"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => processVoiceNote(transcript)}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verarbeite...
                    </>
                  ) : (
                    "Zu Notizen hinzufügen"
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setTranscript("")}>
                  Löschen
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Lightbulb className="h-4 w-4 mr-2" />
            Hilfe bei KI-Eingabe
            {isHelpOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="border-blue-200 bg-blue-50 mt-2">
            <CardContent className="p-4 space-y-4">
              <h4 className="font-semibold text-blue-900">Beispiele für Sprachnotizen:</h4>

              <div className="space-y-3 text-sm">
                <div className="p-3 bg-white rounded border-l-4 border-blue-500">
                  <p className="font-medium text-blue-800">Arbeiten beschreiben:</p>
                  <p className="text-gray-700 italic">
                    "Heute Dachrinne repariert, 2 Meter Rinne ausgetauscht und Fallrohr neu montiert"
                  </p>
                </div>

                <div className="p-3 bg-white rounded border-l-4 border-green-500">
                  <p className="font-medium text-green-800">Materialien erwähnen:</p>
                  <p className="text-gray-700 italic">
                    "Verwendet: 1 Rinne 6-teilig, 4 Rinneisen, Lötmaterial und 2 Meter Fallrohr"
                  </p>
                </div>

                <div className="p-3 bg-white rounded border-l-4 border-orange-500">
                  <p className="font-medium text-orange-800">Probleme dokumentieren:</p>
                  <p className="text-gray-700 italic">
                    "Problem mit alter Befestigung gefunden, muss nächste Woche neue Halterungen besorgen"
                  </p>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <strong>Tipp:</strong> Die KI erkennt automatisch Materialien und fügt sie zur Liste hinzu!
                </p>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
