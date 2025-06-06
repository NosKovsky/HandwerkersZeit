import { NextResponse } from "next/server"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"

export async function GET() {
  try {
    const supabase = createSupabaseServerActionClient()

    const { data: customers, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching customers:", error)
      return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
    }

    return NextResponse.json(customers || [])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
