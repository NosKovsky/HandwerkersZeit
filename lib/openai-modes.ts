import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type SpeechMode = "dashboard" | "timeentry" | "task" | "material"

export interface DashboardCommand {
  type: "create_project" | "create_task" | "add_worktime" | "create_material_order"
  projectInfo?: {
    name: string
    address: string
    city: string
    description?: string
    isExisting: boolean
  }
  taskInfo?: {
    projectAddress: string
    description: string
    priority: "low" | "medium" | "high" | "urgent"
    category: "work" | "material" | "urgent_material"
  }
  worktimeInfo?: {
    projectAddress: string
    startTime: string
    endTime: string
    date: string
    description: string
    breakMinutes?: number
  }
  confidence: number
}

export interface TimeEntryCommand {
  activity: string
  notes: string
  materials?: Array<{
    name: string
    quantity: number
    unit: string
  }>
  confidence: number
}

export async function analyzeDashboardCommand(transcript: string): Promise<DashboardCommand> {
  try {
    const prompt = `
Du bist ein KI-Assistent für Handwerker-Dashboard-Befehle. Analysiere den folgenden Sprachbefehl:

Text: "${transcript}"

Erkenne diese Befehlstypen:
1. "erstelle baustelle/projekt" - Neue Baustelle erstellen
2. "erstelle aufgabe für baustelle" - Aufgabe zu bestehender Baustelle
3. "füge arbeitszeit hinzu" - Arbeitszeit zu Baustelle hinzufügen  
4. "besorgen/kaufen/händler" - Material-Bestellung erstellen

Für Baustellen: Erkenne ob "neue" oder "bestehende" erwähnt wird.
Für Aufgaben: Erkenne Priorität aus Kontext (normal/wichtig/dringend/händler)
Für Arbeitszeit: Erkenne Zeiten, Pausen, Tätigkeiten
Für Adressen: Extrahiere Straße und Stadt

Antworte im JSON-Format:
{
  "type": "create_project|create_task|add_worktime|create_material_order",
  "projectInfo": {
    "name": "Baustelle Schulze",
    "address": "Schulze-Delitzsch-Straße",
    "city": "Herford",
    "description": "Dacharbeiten geplant",
    "isExisting": false
  },
  "taskInfo": {
    "projectAddress": "Schulze-Delitzsch-Straße",
    "description": "3 Gerüst-Rahmen mitnehmen",
    "priority": "high",
    "category": "work"
  },
  "worktimeInfo": {
    "projectAddress": "Schulze-Delitzsch-Straße", 
    "startTime": "07:00",
    "endTime": "13:30",
    "date": "2024-01-15",
    "description": "Dachrinne repariert",
    "breakMinutes": 15
  },
  "confidence": 0.95
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du bist Experte für deutsche Handwerker-Befehle und Adressen. Antworte immer im JSON-Format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error("Keine Antwort von OpenAI erhalten")
    }

    return JSON.parse(response) as DashboardCommand
  } catch (error) {
    console.error("OpenAI Dashboard Command Error:", error)
    return {
      type: "create_project",
      confidence: 0.3,
    }
  }
}

export async function analyzeTimeEntryCommand(transcript: string): Promise<TimeEntryCommand> {
  try {
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

    return JSON.parse(response) as TimeEntryCommand
  } catch (error) {
    console.error("OpenAI Time Entry Error:", error)
    return {
      activity: "Allgemeine Arbeiten",
      notes: transcript,
      confidence: 0.5,
    }
  }
}
