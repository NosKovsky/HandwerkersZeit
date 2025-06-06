import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching projects:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(projects || [])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
