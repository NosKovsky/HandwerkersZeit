import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ParsedEntry {
  activity: string
  notes: string
  materials: Array<{ name: string; quantity: number; unit: string }>
  duration?: string
  confidence: number
  suggestions?: string[]
}

export async function analyzeWorkEntry(transcript: string): Promise<ParsedEntry> {
  try {
    const prompt = `
Du bist ein KI-Assistent für Handwerker und analysierst Spracheingaben von Baustelleneinträgen.
Analysiere den folgenden Text und extrahiere strukturierte Informationen:

Text: "${transcript}"

Bitte analysiere und gib zurück:
1. Hauptaktivität (z.B. "Dacharbeiten", "Reparatur", "Montage")
2. Verwendete Materialien mit Mengen (z.B. "20 Ziegel", "5 Meter Dachrinne")
3. Geschätzte Arbeitszeit falls erwähnt
4. Vollständige Notizen
5. Verbesserungsvorschläge für zukünftige Einträge

Antworte im JSON-Format:
{
  "activity": "Erkannte Hauptaktivität",
  "materials": [{"name": "Material", "quantity": 10, "unit": "Stück"}],
  "duration": "Erkannte Dauer oder null",
  "notes": "Vollständiger Text",
  "confidence": 0.95,
  "suggestions": ["Tipp 1", "Tipp 2"]
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Experte für Handwerksarbeiten und hilfst bei der Strukturierung von Arbeitseinträgen. Antworte immer im JSON-Format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error("Keine Antwort von OpenAI erhalten")
    }

    // Parse JSON response
    const parsed = JSON.parse(response) as ParsedEntry

    // Validate and ensure required fields
    return {
      activity: parsed.activity || "Allgemeine Arbeiten",
      notes: parsed.notes || transcript,
      materials: parsed.materials || [],
      duration: parsed.duration,
      confidence: Math.min(Math.max(parsed.confidence || 0.8, 0), 1),
      suggestions: parsed.suggestions || [],
    }
  } catch (error) {
    console.error("OpenAI API Error:", error)

    // Fallback to simple analysis if API fails
    return {
      activity: "Allgemeine Arbeiten",
      notes: transcript,
      materials: [],
      confidence: 0.5,
      suggestions: ["Versuchen Sie es später erneut, wenn die KI-Analyse verfügbar ist."],
    }
  }
}

export async function generateWorkSummary(entries: any[]): Promise<string> {
  try {
    const prompt = `
Erstelle eine professionelle Zusammenfassung der folgenden Arbeitseinträge für einen Handwerksbetrieb:

${entries
  .map(
    (entry) => `
- ${entry.activity}: ${entry.notes}
- Materialien: ${entry.materials_used ? JSON.stringify(entry.materials_used) : "Keine"}
- Datum: ${entry.entry_date}
`,
  )
  .join("\n")}

Erstelle eine strukturierte Zusammenfassung mit:
1. Überblick der durchgeführten Arbeiten
2. Verwendete Materialien (zusammengefasst)
3. Empfehlungen für zukünftige Arbeiten
4. Geschätzte Gesamtarbeitszeit

Schreibe professionell aber verständlich für Handwerker.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du bist ein Experte für Handwerksarbeiten und erstellst professionelle Arbeitszusammenfassungen.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 800,
    })

    return completion.choices[0]?.message?.content || "Zusammenfassung konnte nicht erstellt werden."
  } catch (error) {
    console.error("OpenAI Summary Error:", error)
    return "Zusammenfassung konnte nicht erstellt werden. Versuchen Sie es später erneut."
  }
}
