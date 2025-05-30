"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import Layout from "@/components/layout"
import AuthGuard from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MicOff, Plus, Camera, X, FileText } from "lucide-react"

interface Entry {
  id: string
  date: string
  time: string
  project: string
  activity: string
  materials: string | null
  images: string[] | null
  created_at: string
}

export default function EntriesPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    project: "",
    activity: "",
    materials: "",
    images: [] as File[],
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      fetchEntries()
    }
  }, [user])

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("Error fetching entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processAudioWithAI(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      setError("Mikrofon-Zugriff fehlgeschlagen")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudioWithAI = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.wav")

      const response = await fetch("/api/speech-to-entry", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Sprachverarbeitung fehlgeschlagen")

      const result = await response.json()

      // Update form with AI-extracted data
      setFormData((prev) => ({
        ...prev,
        project: result.project || prev.project,
        activity: result.activity || prev.activity,
        materials: result.materials || prev.materials,
      }))

      setSuccess("Spracheingabe erfolgreich verarbeitet!")
    } catch (error) {
      console.error("Error processing audio:", error)
      setError("Fehler bei der Sprachverarbeitung")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Upload images first
      const imageUrls: string[] = []
      for (const image of formData.images) {
        const fileName = `${Date.now()}-${image.name}`
        const { data, error } = await supabase.storage.from("images").upload(fileName, image)

        if (error) throw error
        imageUrls.push(data.path)
      }

      // Create entry
      const { error } = await supabase.from("entries").insert({
        user_id: user!.id,
        date: formData.date,
        time: formData.time,
        project: formData.project,
        activity: formData.activity,
        materials: formData.materials || null,
        images: imageUrls.length > 0 ? imageUrls : null,
      })

      if (error) throw error

      setSuccess("Eintrag erfolgreich erstellt!")
      setFormData({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().slice(0, 5),
        project: "",
        activity: "",
        materials: "",
        images: [],
      })
      setShowForm(false)
      fetchEntries()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Arbeitseinträge</h1>
              <p className="mt-2 text-gray-600">Verwalten Sie Ihre täglichen Arbeitseinträge</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Eintrag
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Entry Form Modal */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Neuer Arbeitseintrag</CardTitle>
                <CardDescription>Erfassen Sie Ihren Arbeitseintrag manuell oder per Spracheingabe</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Datum</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Uhrzeit</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="project">Baustelle/Projekt</Label>
                    <Input
                      id="project"
                      value={formData.project}
                      onChange={(e) => setFormData((prev) => ({ ...prev, project: e.target.value }))}
                      placeholder="z.B. Neubau Musterstraße 123"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="activity">Tätigkeit</Label>
                    <Textarea
                      id="activity"
                      value={formData.activity}
                      onChange={(e) => setFormData((prev) => ({ ...prev, activity: e.target.value }))}
                      placeholder="Beschreibung der durchgeführten Arbeiten"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="materials">Material</Label>
                    <Textarea
                      id="materials"
                      value={formData.materials}
                      onChange={(e) => setFormData((prev) => ({ ...prev, materials: e.target.value }))}
                      placeholder="Verwendete Materialien (optional)"
                    />
                  </div>

                  {/* Voice Recording */}
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="mr-2 h-4 w-4" />
                          Aufnahme stoppen
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Spracheingabe
                        </>
                      )}
                    </Button>
                    {isRecording && <span className="text-red-600 animate-pulse">Aufnahme läuft...</span>}
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label>Bilder</Label>
                    <div className="mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="mr-2 h-4 w-4" />
                        Bilder hinzufügen
                      </Button>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image) || "/placeholder.svg"}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Wird gespeichert..." : "Eintrag erstellen"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Entries List */}
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{entry.date}</span>
                        <span>{entry.time}</span>
                      </div>
                      <h3 className="font-semibold text-lg">{entry.project}</h3>
                      <p className="text-gray-700">{entry.activity}</p>
                      {entry.materials && (
                        <div>
                          <span className="font-medium">Material: </span>
                          <span className="text-gray-600">{entry.materials}</span>
                        </div>
                      )}
                      {entry.images && entry.images.length > 0 && (
                        <div className="flex space-x-2 mt-2">
                          {entry.images.map((image, index) => (
                            <img
                              key={index}
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${image}`}
                              alt={`Bild ${index + 1}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {entries.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Einträge</h3>
                <p className="mt-1 text-sm text-gray-500">Erstellen Sie Ihren ersten Arbeitseintrag.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </AuthGuard>
  )
}
