import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    const { data: events, error } = await supabase.from("calendar_events").select("*")

    if (error) {
      console.error("Error fetching calendar events:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fallback für leere Datenbank
    const calendarEvents = events || []

    return NextResponse.json(calendarEvents)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const eventData = await request.json()

    const { data, error } = await supabase.from("calendar_events").insert(eventData).select()

    if (error) {
      console.error("Error creating calendar event:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
