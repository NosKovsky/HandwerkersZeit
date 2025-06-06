import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"

export async function POST(request: NextRequest) {
  try {
    const { projectId, location, timestamp } = await request.json()
    const supabase = await createSupabaseServerActionClient()

    // 1. Zeiterfassung automatisch starten
    const { data: timeEntry } = await supabase
      .from("time_entries")
      .insert({
        project_id: projectId,
        entry_time: new Date(timestamp).toTimeString().slice(0, 5),
        location: location,
        status: "active",
      })
      .select()
      .single()

    // 2. Typische Materialien für dieses Projekt vorschlagen
    const { data: suggestedMaterials } = await supabase
      .from("materials")
      .select("*")
      .eq("project_id", projectId)
      .limit(5)

    // 3. Letzten Arbeitsplatz merken
    await supabase.from("user_preferences").upsert({
      user_id: "current_user", // Hier würde die echte User-ID stehen
      last_project_id: projectId,
      last_location: location,
    })

    return NextResponse.json({
      success: true,
      timeEntry,
      suggestedMaterials,
    })
  } catch (error) {
    console.error("Quick start error:", error)
    return NextResponse.json({ error: "Fehler beim Starten" }, { status: 500 })
  }
}
