import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert audio to text using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "de",
    })

    const transcript = transcription.text

    // Use GPT-4 to extract structured data from the transcript
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Du bist ein Assistent für Bauleiter. Extrahiere aus dem gesprochenen Text strukturierte Informationen für einen Arbeitseintrag. 
          
          Antworte nur mit einem JSON-Objekt mit folgenden Feldern:
          - project: Name der Baustelle/des Projekts
          - activity: Beschreibung der Tätigkeit
          - materials: Liste der verwendeten Materialien
          
          Wenn Informationen nicht verfügbar sind, setze sie auf null.
          
          Beispiel für Sprachkommandos:
          - "Füge hinzu: Projekt Musterstraße, Betonarbeiten, 5 Säcke Zement"
          - "Ändere Projekt zu Bahnhofstraße"
          - "Material: 10 Meter Bewehrungsstahl"
          
          Extrahiere nur die relevanten Informationen und ignoriere Füllwörter.`,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      temperature: 0.1,
    })

    const result = completion.choices[0]?.message?.content

    if (!result) {
      throw new Error("No response from GPT-4")
    }

    try {
      const parsedResult = JSON.parse(result)
      return NextResponse.json({
        transcript,
        ...parsedResult,
      })
    } catch (parseError) {
      // If JSON parsing fails, return the raw transcript
      return NextResponse.json({
        transcript,
        project: null,
        activity: transcript,
        materials: null,
      })
    }
  } catch (error) {
    console.error("Error processing speech:", error)
    return NextResponse.json({ error: "Failed to process speech" }, { status: 500 })
  }
}
