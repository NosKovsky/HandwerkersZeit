import { type NextRequest, NextResponse } from "next/server"
import { suggestMaterials, estimateWorkTime, analyzeReceipt, analyzeProjectProgress } from "@/lib/ai-enhancements"

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    switch (type) {
      case "materials":
        const materials = await suggestMaterials(data.activity, data.projectType)
        return NextResponse.json({ materials })

      case "time":
        const timeEstimate = await estimateWorkTime(data.activity, data.materials, data.complexity)
        return NextResponse.json({ timeEstimate })

      case "receipt":
        const receiptAnalysis = await analyzeReceipt(data.receiptText)
        return NextResponse.json({ receiptAnalysis })

      case "progress":
        const progressAnalysis = await analyzeProjectProgress(data.entries)
        return NextResponse.json({ progressAnalysis })

      default:
        return NextResponse.json({ error: "Unbekannter Typ" }, { status: 400 })
    }
  } catch (error) {
    console.error("AI suggestions error:", error)
    return NextResponse.json({ error: "Fehler bei der KI-Analyse" }, { status: 500 })
  }
}
