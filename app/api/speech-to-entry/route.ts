import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server"
import OpenAI from "openai"

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
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    const fileForOpenAi = new File([audioBuffer], audioFile.name, {
      type: audioFile.type,
    })
    const transcriptionResponse = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: fileForOpenAi,
      response_format: "text",
      language: "de",
    })
    const transcript = transcriptionResponse.trim()

    // GPT-4o Datenextraktion
    const gptPrompt = `Extrahiere aus dem folgenden Text die Felder für einen Baustelleneintrag:
Datum (YYYY-MM-DD), Uhrzeit (HH:MM), Baustelle (Name), Tätigkeit, Material (Liste von {name, menge, einheit}), Notizen.
Text: "${transcript}"
Antworte nur im JSON Format: {"entry_date":"","entry_time":"","project_name_guess":"","activity":"","materials_guess":[{"name":"","quantity":0,"unit":""}],"notes":""}`

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: gptPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    })

    const extractedData = JSON.parse(
      gptResponse.choices[0]?.message?.content ?? "{}",
    ) as {
      entry_date: string
      entry_time: string
      project_name_guess?: string
      activity: string
      materials_guess: Array<{ name: string; quantity: number; unit: string }>
      notes: string
    }

    // Projekt anhand des Namens finden
    let project_id: string | null = null
    if (extractedData.project_name_guess) {
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .ilike("name", `%${extractedData.project_name_guess}%`)
        .limit(1)
        .single()
      if (project) {
        project_id = project.id
      }
    }

    // Materialien zuordnen
    const materials_used: {
      material_id: string
      name: string
      unit: string | null
      quantity: number
    }[] = []
    if (Array.isArray(extractedData.materials_guess)) {
      for (const mat of extractedData.materials_guess) {
        const { data: material } = await supabase
          .from("materials")
          .select("id, name, unit")
          .ilike("name", `%${mat.name}%`)
          .limit(1)
          .single()
        if (material) {
          materials_used.push({
            material_id: material.id,
            name: material.name,
            unit: material.unit,
            quantity: mat.quantity,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      transcript,
      project_id,
      materials_used,
      extractedData,
    })
  } catch (error) {
    console.error("Error in speech-to-entry API:", error)
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler"
    return NextResponse.json({ error: "Fehler bei der Sprachverarbeitung", details: errorMessage }, { status: 500 })
  }
}
