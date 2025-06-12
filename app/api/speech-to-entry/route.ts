import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server"
import OpenAI, { toFile } from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API Key nicht konfiguriert." }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File | null

    if (!audioFile) {
      return NextResponse.json({ error: "Keine Audiodatei empfangen" }, { status: 400 })
    }

    // Whisper Transkription
    const transcriptionResponse = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: await toFile(audioFile, audioFile.name),
    })
    const transcript = transcriptionResponse.text

    // GPT-4o Datenextraktion
    const gptPrompt = `Extrahiere aus dem folgenden Text die Felder für einen Baustelleneintrag:
Datum (YYYY-MM-DD), Uhrzeit (HH:MM), Baustelle (Name), Tätigkeit, Material (Liste von {name, menge, einheit}), Notizen.
Text: "${transcript}"
Antworte nur im JSON Format: {"entry_date":"YYYY-MM-DD","entry_time":"HH:MM","project_name_guess":"...","activity":"...","materials_guess":[{"name":"","quantity":0,"unit":""}],"notes":"..."}`
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: gptPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 400,
    })
    const extractedData = JSON.parse(gptResponse.choices[0].message.content || "{}")

    // TODO: Logik zum Abgleichen von project_name_guess mit existierenden Projekten
    // TODO: Logik zum Abgleichen von materials_guess mit existierenden Materialien und Erstellen von materials_used JSON

    // Fürs Erste geben wir die extrahierten Daten zurück
    return NextResponse.json({ success: true, transcript, extractedData })
  } catch (error) {
    console.error("Error in speech-to-entry API:", error)
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler"
    return NextResponse.json({ error: "Fehler bei der Sprachverarbeitung", details: errorMessage }, { status: 500 })
  }
}
