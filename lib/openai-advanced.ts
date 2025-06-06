import OpenAI from "openai"
import { z } from "zod"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AdvancedParsedEntry {
  // Grunddaten
  activity: string
  notes: string
  startTime: string
  endTime: string
  date: string

  // Kunde/Baustelle
  customer?: {
    name: string
    address: {
      street: string
      city: string
      zipCode?: string
    }
  }

  // Materialien
  materials: Array<{
    name: string
    quantity: number
    unit: string
    category: "used" | "needed"
  }>

  // Aufgaben
  tasks: Array<{
    description: string
    priority: "low" | "medium" | "high"
    dueDate?: string
  }>

  // Metadaten
  confidence: number
  suggestions?: string[]
  location?: {
    street: string
    city: string
    zipCode?: string
  }
}

// Direkt unter den Interface-Definitionen
const AdvancedParsedEntrySchema = z.object({
  activity: z.string().min(1),
  notes: z.string(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Ungültiges Zeitformat HH:MM"), // HH:MM Format
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Ungültiges Zeitformat HH:MM"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ungültiges Datumsformat YYYY-MM-DD"), // YYYY-MM-DD Format
  customer: z
    .object({
      name: z.string(),
      address: z.object({
        street: z.string(),
        city: z.string(),
        zipCode: z.string().optional(),
      }),
    })
    .optional(),
  materials: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
      category: z.enum(["used", "needed"]),
    }),
  ),
  tasks: z.array(
    z.object({
      description: z.string(),
      priority: z.enum(["low", "medium", "high"]),
      dueDate: z.string().optional(),
    }),
  ),
  location: z
    .object({
      street: z.string(),
      city: z.string(),
      zipCode: z.string().optional(),
    })
    .optional(),
  confidence: z.number().min(0).max(1),
  suggestions: z.array(z.string()).optional(),
})

export async function analyzeAdvancedWorkEntry(transcript: string): Promise<AdvancedParsedEntry> {
  try {
    const prompt = `
Du bist ein KI-Assistent für Handwerker und analysierst komplexe Spracheingaben von Baustelleneinträgen.
Analysiere den folgenden Text und extrahiere ALLE Informationen strukturiert:

Text: "${transcript}"

Hier sind einige Beispiele, wie die Ausgabe aussehen soll:

Beispiel 1:
Text: "Heute bei Herr Müller in der Hauptstraße 10 in Berlin Dachrinne gereinigt von 8 bis 12 Uhr. Habe 2 Rohrschellen benutzt. Muss noch Silikon besorgen."
JSON:
{
  "activity": "Dachrinne gereinigt",
  "notes": "Heute bei Herr Müller in der Hauptstraße 10 in Berlin Dachrinne gereinigt von 8 bis 12 Uhr. Habe 2 Rohrschellen benutzt. Muss noch Silikon besorgen.",
  "startTime": "08:00",
  "endTime": "12:00",
  "date": "${new Date().toISOString().split("T")[0]}", // Aktuelles Datum, wenn nicht anders angegeben
  "customer": {
    "name": "Herr Müller",
    "address": {
      "street": "Hauptstraße 10",
      "city": "Berlin",
      "zipCode": "10115" // Beispiel PLZ für Berlin Mitte
    }
  },
  "materials": [
    {"name": "Rohrschellen", "quantity": 2, "unit": "Stück", "category": "used"}
  ],
  "tasks": [
    {"description": "Silikon besorgen", "priority": "medium", "dueDate": ""}
  ],
  "location": {
    "street": "Hauptstraße 10",
    "city": "Berlin",
    "zipCode": "10115"
  },
  "confidence": 0.9,
  "suggestions": ["Prüfe, ob die PLZ korrekt ist."]
}

Beispiel 2:
Text: "Baustelle Schmidt, Gartenweg 5, Hamburg. Fenster eingesetzt von 13 bis 16:30. Brauche noch 3 Tuben Acryl."
JSON:
{
  "activity": "Fenster eingesetzt",
  "notes": "Baustelle Schmidt, Gartenweg 5, Hamburg. Fenster eingesetzt von 13 bis 16:30. Brauche noch 3 Tuben Acryl.",
  "startTime": "13:00",
  "endTime": "16:30",
  "date": "${new Date().toISOString().split("T")[0]}",
  "customer": {
    "name": "Schmidt", // Annahme, da "Baustelle Schmidt"
    "address": {
      "street": "Gartenweg 5",
      "city": "Hamburg",
      "zipCode": "20095" // Beispiel PLZ für Hamburg Zentrum
    }
  },
  "materials": [], // Keine explizit als "verwendet" markiert
  "tasks": [
    {"description": "3 Tuben Acryl besorgen", "priority": "high"}
  ],
  "location": {
    "street": "Gartenweg 5",
    "city": "Hamburg",
    "zipCode": "20095"
  },
  "confidence": 0.88,
  "suggestions": ["Kundenname könnte präziser sein."]
}

Erkenne und extrahiere für den aktuellen Text:
1. Arbeitszeiten (von X bis Y, heute von X-Y, etc.)
2. Kunde/Auftraggeber (Herr/Frau Name)
3. Adresse/Ort (Straße, Stadt, PLZ wenn möglich)
4. Durchgeführte Arbeiten/Tätigkeiten
5. VERWENDETE Materialien mit Mengen
6. BENÖTIGTE/ZU BESORGENE Materialien (Aufgaben!)
7. Aufgaben für die Zukunft ("ist noch zu besorgen", "muss geholt werden")

Für deutsche Adressen: Versuche PLZ zu ermitteln wenn Stadt bekannt ist.
Für Materialien: Unterscheide zwischen "verwendet" und "benötigt"
Für Aufgaben: Erkenne Priorität aus Kontext

Antworte im JSON-Format:
{
  "activity": "Haupttätigkeit",
  "notes": "Vollständiger Text",
  "startTime": "07:00",
  "endTime": "16:00",
  "date": "2024-01-15",
  "customer": {
    "name": "Herr Schulze",
    "address": {
      "street": "Schulze-Delitzsch-Straße 15",
      "city": "Herford",
      "zipCode": "32052"
    }
  },
  "materials": [
    {"name": "6-tlg Rinne", "quantity": 1, "unit": "Stück", "category": "used"},
    {"name": "Einhangstutzen", "quantity": 1, "unit": "Stück", "category": "needed"}
  ],
  "tasks": [
    {"description": "Einhangstutzen beim Händler holen", "priority": "high", "dueDate": "2024-01-16"}
  ],
  "location": {
    "street": "Schulze-Delitzsch-Straße",
    "city": "Herford", 
    "zipCode": "32052"
  },
  "confidence": 0.95,
  "suggestions": ["Tipp 1"]
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Experte für deutsche Handwerksarbeiten, Adressen und Materialien. Du kennst deutsche Städte und PLZ. Antworte immer im JSON-Format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      console.error("Keine Antwort von OpenAI erhalten für Transcript:", transcript)
      throw new Error("Keine Antwort von OpenAI erhalten")
    }

    let parsedResponse
    try {
      parsedResponse = JSON.parse(response)
    } catch (jsonError) {
      console.error("Fehler beim Parsen der OpenAI JSON-Antwort:", jsonError, "Antwort war:", response)
      // Fallback, wenn JSON ungültig ist
      return {
        activity: "Manuelle Eingabe erforderlich",
        notes: transcript + "\n\n[KI-Analyse fehlgeschlagen: Ungültiges JSON]",
        startTime: "00:00",
        endTime: "00:00",
        date: new Date().toISOString().split("T")[0],
        materials: [],
        tasks: [],
        confidence: 0.1,
        suggestions: ["Die KI konnte die Eingabe nicht verarbeiten. Bitte prüfe die Daten manuell."],
      }
    }

    const validationResult = AdvancedParsedEntrySchema.safeParse(parsedResponse)

    if (!validationResult.success) {
      console.error(
        "OpenAI Antwort Validierungsfehler:",
        validationResult.error.flatten(),
        "Antwort war:",
        parsedResponse,
      )
      // Fallback mit den Daten, die geparst werden konnten, aber mit Hinweis
      const partialData = parsedResponse as Partial<AdvancedParsedEntry> // Cast zu Partial, um auf vorhandene Felder zuzugreifen
      return {
        activity: partialData.activity || "Manuelle Prüfung nötig (Validierungsfehler)",
        notes: partialData.notes || transcript + "\n\n[KI-Validierung fehlgeschlagen, bitte Daten prüfen]",
        startTime:
          partialData.startTime && /^([01]\d|2[0-3]):([0-5]\d)$/.test(partialData.startTime)
            ? partialData.startTime
            : "00:00",
        endTime:
          partialData.endTime && /^([01]\d|2[0-3]):([0-5]\d)$/.test(partialData.endTime)
            ? partialData.endTime
            : "00:00",
        date:
          partialData.date && /^\d{4}-\d{2}-\d{2}$/.test(partialData.date)
            ? partialData.date
            : new Date().toISOString().split("T")[0],
        customer: partialData.customer, // Behalte, was da ist
        materials: Array.isArray(partialData.materials) ? partialData.materials : [],
        tasks: Array.isArray(partialData.tasks) ? partialData.tasks : [],
        location: partialData.location,
        confidence: partialData.confidence || 0.2,
        suggestions: [
          ...(partialData.suggestions || []),
          "Einige Daten konnten nicht validiert werden. Bitte manuell prüfen.",
        ],
      }
    }

    const parsed = validationResult.data // Jetzt haben wir validierte Daten

    // Fallback-Werte setzen (kann jetzt präziser sein, da Zod Standardwerte setzen kann, falls im Schema definiert)
    return {
      activity: parsed.activity || "Allgemeine Arbeiten", // Sollte durch Zod .min(1) nicht mehr nötig sein
      notes: parsed.notes || transcript,
      startTime: parsed.startTime || "08:00",
      endTime: parsed.endTime || "16:00",
      date: parsed.date || new Date().toISOString().split("T")[0],
      customer: parsed.customer,
      materials: parsed.materials || [],
      tasks: parsed.tasks || [],
      location: parsed.location,
      confidence: Math.min(Math.max(parsed.confidence || 0.8, 0), 1),
      suggestions: parsed.suggestions || [],
    }
  } catch (error) {
    console.error("OpenAI Advanced API Error:", error)

    // Fallback
    return {
      activity: "Allgemeine Arbeiten",
      notes: transcript,
      startTime: "08:00",
      endTime: "16:00",
      date: new Date().toISOString().split("T")[0],
      materials: [],
      tasks: [],
      confidence: 0.5,
      suggestions: ["Versuchen Sie es später erneut."],
    }
  }
}
