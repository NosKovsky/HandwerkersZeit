import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import type { TimeEntryCommand } from "@/lib/openai-modes"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        activity: "Allgemeine Arbeiten",
        notes: transcript,
        confidence: 0.5,
      } as TimeEntryCommand)
    }

    const prompt = `
Analysiere diese Zeiterfassungs-Notiz für Handwerker:

Text: "${transcript}"

Extrahiere:
- Haupttätigkeit (kurz)
- Detaillierte Notizen
- Verwendete Materialien mit Mengen

Antworte im JSON-Format:
{
  "activity": "Dachrinne repariert",
  "notes": "Vollständiger Text der Arbeiten",
  "materials": [
    {"name": "Rinne 6-tlg", "quantity": 1, "unit": "Stück"}
  ],
  "confidence": 0.95
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du bist Experte für Handwerker-Zeiterfassung. Antworte immer im JSON-Format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error("Keine Antwort von OpenAI erhalten")
    }

    const result = JSON.parse(response) as TimeEntryCommand
    return NextResponse.json(result)
  } catch (error) {
    console.error("OpenAI Time Entry Error:", error)
    const transcript = "Error processing transcript" // Declare transcript variable here
    return NextResponse.json({
      activity: "Allgemeine Arbeiten",
      notes: transcript,
      confidence: 0.5,
    } as TimeEntryCommand)
  }
}
