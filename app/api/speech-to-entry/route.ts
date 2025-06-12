import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server"
// import { OpenAI } from "openai"; // Später für Whisper & GPT

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    // TODO: Implement Whisper Transkription
    // const transcriptionResponse = await openai.audio.transcriptions.create({
    //   model: "whisper-1",
    //   file: audioFile,
    // });
    // const transcript = transcriptionResponse.text;
    const transcript =
      "Beispiel Transkript: Heute 14 Uhr Baustelle Alpha, Material 5 Meter Rinne und 10 Haken, Tätigkeit Dachrinne montiert." // Platzhalter

    // TODO: Implement GPT-4o Datenextraktion
    // const gptPrompt = `Extrahiere aus dem folgenden Text die Felder für einen Baustelleneintrag:
    // Datum (YYYY-MM-DD), Uhrzeit (HH:MM), Baustelle (Name), Tätigkeit, Material (Liste von {name, menge, einheit}), Notizen.
    // Text: "${transcript}"
    // Antworte nur im JSON Format: {"date": "...", "time": "...", ...}`;
    // const gptResponse = await openai.chat.completions.create({
    //    model: "gpt-4o", // oder gpt-3.5-turbo für Kostenersparnis
    //    messages: [{ role: "user", content: gptPrompt }],
    //    response_format: { type: "json_object" },
    // });
    // const extractedData = JSON.parse(gptResponse.choices[0].message.content || "{}");
    const extractedData = {
      // Platzhalter
      entry_date: new Date().toISOString().split("T")[0],
      entry_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
      project_name_guess: "Baustelle Alpha", // Muss dann zu project_id aufgelöst werden
      activity: "Dachrinne montiert (via Sprache)",
      materials_guess: [
        { name: "Rinne", quantity: 5, unit: "Meter" },
        { name: "Haken", quantity: 10, unit: "Stk" },
      ],
      notes: `Transkript: ${transcript}`,
    }

    // Projekt-Abgleich
    let matchedProject: { id: string; name: string } | null = null
    if (extractedData.project_name_guess) {
      const { data: project } = await supabase
        .from("projects")
        .select("id, name")
        .ilike("name", `%${extractedData.project_name_guess}%`)
        .limit(1)
        .single()

      if (project) {
        matchedProject = project
      }
    }

    // Material-Abgleich
    const materialsUsed: any[] = []
    if (Array.isArray(extractedData.materials_guess)) {
      for (const item of extractedData.materials_guess) {
        const { data: material } = await supabase
          .from("materials")
          .select("id, name, unit")
          .ilike("name", `%${item.name}%`)
          .limit(1)
          .single()

        if (material) {
          materialsUsed.push({
            material_id: material.id,
            name: material.name,
            quantity: item.quantity,
            unit: material.unit || item.unit,
          })
        } else {
          materialsUsed.push(item)
        }
      }
    }

    const responseData = {
      entry_date: extractedData.entry_date,
      entry_time: extractedData.entry_time,
      project_id: matchedProject?.id || null,
      activity: extractedData.activity,
      materials_used: materialsUsed,
      notes: extractedData.notes,
    }

    return NextResponse.json({
      success: true,
      transcript,
      entryData: responseData,
      matchedProject,
    })
  } catch (error) {
    console.error("Error in speech-to-entry API:", error)
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler"
    return NextResponse.json({ error: "Fehler bei der Sprachverarbeitung", details: errorMessage }, { status: 500 })
  }
}
