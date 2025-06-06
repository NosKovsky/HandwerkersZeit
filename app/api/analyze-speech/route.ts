import { type NextRequest, NextResponse } from "next/server"
import { analyzeWorkEntry } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "Transcript ist erforderlich" }, { status: 400 })
    }

    const analysis = await analyzeWorkEntry(transcript)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Speech analysis error:", error)
    return NextResponse.json({ error: "Fehler bei der Sprachanalyse" }, { status: 500 })
  }
}
