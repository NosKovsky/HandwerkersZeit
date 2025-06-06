import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface MaterialSuggestion {
  name: string
  estimatedQuantity: number
  unit: string
  category: string
  confidence: number
  reason: string
}

export interface TimeEstimate {
  estimatedHours: number
  confidence: number
  factors: string[]
  suggestions: string[]
}

export interface ReceiptAnalysis {
  company: string
  amount: number
  date: string
  category: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  confidence: number
}

// Intelligente Materialvorschläge basierend auf Aktivität
export async function suggestMaterials(activity: string, projectType?: string): Promise<MaterialSuggestion[]> {
  try {
    const prompt = `
Du bist ein Experte für Handwerksarbeiten und Materialien. 
Analysiere die folgende Tätigkeit und schlage passende Materialien vor:

Tätigkeit: "${activity}"
Projekttyp: "${projectType || "Allgemein"}"

Berücksichtige typische deutsche Handwerksmaterialien und realistische Mengen.
Gib 5-8 relevante Materialvorschläge zurück.

Antworte im JSON-Format:
{
  "materials": [
    {
      "name": "Material Name",
      "estimatedQuantity": 10,
      "unit": "Stück/Meter/kg",
      "category": "Kategorie",
      "confidence": 0.85,
      "reason": "Begründung warum dieses Material benötigt wird"
    }
  ]
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du bist ein Experte für deutsche Handwerksarbeiten und Materialien. Antworte immer im JSON-Format.",
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
    if (!response) return []

    const parsed = JSON.parse(response)
    return parsed.materials || []
  } catch (error) {
    console.error("Material suggestion error:", error)
    return []
  }
}

// Zeitschätzung für Aufgaben
export async function estimateWorkTime(
  activity: string,
  materials: any[],
  projectComplexity: "simple" | "medium" | "complex" = "medium",
): Promise<TimeEstimate> {
  try {
    const prompt = `
Du bist ein erfahrener Handwerksmeister und schätzt Arbeitszeiten ein.

Tätigkeit: "${activity}"
Materialien: ${JSON.stringify(materials)}
Komplexität: ${projectComplexity}

Schätze die benötigte Arbeitszeit ein und berücksichtige:
- Vorbereitung und Nachbereitung
- Materialhandling
- Typische Arbeitsgeschwindigkeit
- Mögliche Komplikationen

Antworte im JSON-Format:
{
  "estimatedHours": 4.5,
  "confidence": 0.8,
  "factors": ["Faktor 1", "Faktor 2"],
  "suggestions": ["Tipp 1", "Tipp 2"]
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du bist ein erfahrener deutscher Handwerksmeister mit 20+ Jahren Erfahrung.",
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
      return {
        estimatedHours: 4,
        confidence: 0.5,
        factors: ["Standardschätzung"],
        suggestions: ["Detailliertere Informationen für bessere Schätzung"],
      }
    }

    return JSON.parse(response)
  } catch (error) {
    console.error("Time estimation error:", error)
    return {
      estimatedHours: 4,
      confidence: 0.5,
      factors: ["Fehler bei der Schätzung"],
      suggestions: ["Manuelle Zeitschätzung verwenden"],
    }
  }
}

// Beleg-Analyse mit OCR-Simulation
export async function analyzeReceipt(receiptText: string): Promise<ReceiptAnalysis> {
  try {
    const prompt = `
Du bist ein Experte für deutsche Handwerksbelege und analysierst Kassenbons.
Analysiere den folgenden Belegtext und extrahiere alle Informationen:

Belegtext: "${receiptText}"

Erkenne:
- Firmenname
- Gesamtbetrag
- Datum
- Einzelne Artikel mit Preisen
- Kategorie (Werkzeug, Material, Fahrzeug, etc.)

Antworte im JSON-Format:
{
  "company": "Firmenname",
  "amount": 123.45,
  "date": "2024-01-15",
  "category": "Material",
  "items": [
    {
      "name": "Artikel",
      "quantity": 2,
      "unitPrice": 10.50,
      "totalPrice": 21.00
    }
  ],
  "confidence": 0.9
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du bist ein Experte für deutsche Kassenbons und Handwerksbelege.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error("Keine Antwort erhalten")
    }

    return JSON.parse(response)
  } catch (error) {
    console.error("Receipt analysis error:", error)
    return {
      company: "Unbekannt",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      category: "Sonstiges",
      items: [],
      confidence: 0.1,
    }
  }
}

// Projektfortschritt-Analyse
export async function analyzeProjectProgress(entries: any[]): Promise<{
  completionPercentage: number
  nextSteps: string[]
  risks: string[]
  recommendations: string[]
}> {
  try {
    const prompt = `
Du bist ein Projektmanager für Handwerksprojekte.
Analysiere die folgenden Arbeitseinträge und bewerte den Projektfortschritt:

Einträge: ${JSON.stringify(entries.slice(-10))} // Nur letzte 10 Einträge

Bewerte:
- Fortschritt in Prozent
- Nächste logische Schritte
- Mögliche Risiken
- Verbesserungsvorschläge

Antworte im JSON-Format:
{
  "completionPercentage": 65,
  "nextSteps": ["Schritt 1", "Schritt 2"],
  "risks": ["Risiko 1", "Risiko 2"],
  "recommendations": ["Empfehlung 1", "Empfehlung 2"]
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du bist ein erfahrener Projektmanager für deutsche Handwerksbetriebe.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error("Keine Antwort erhalten")
    }

    return JSON.parse(response)
  } catch (error) {
    console.error("Project analysis error:", error)
    return {
      completionPercentage: 50,
      nextSteps: ["Weitere Arbeiten fortsetzen"],
      risks: ["Keine spezifischen Risiken erkannt"],
      recommendations: ["Regelmäßige Fortschrittskontrolle"],
    }
  }
}
