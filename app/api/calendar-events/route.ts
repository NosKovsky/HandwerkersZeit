import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"

export async function GET() {
  try {
    const supabase = await createSupabaseServerActionClient()

    // Simulierte Kalender-Events - in der Realität würden diese aus der DB kommen
    const events = [
      {
        id: "1",
        title: "Dacharbeiten Herr Müller",
        start: new Date(2024, 11, 15, 8, 0),
        end: new Date(2024, 11, 15, 16, 0),
        resource: {
          type: "project",
          projectId: "1",
          projectName: "Baustelle Müller",
          description: "Dachziegel erneuern und Rinne reparieren",
          location: "Hauptstraße 15, Hamburg",
          priority: "high",
          status: "planned",
        },
      },
      {
        id: "2",
        title: "Material abholen",
        start: new Date(2024, 11, 16, 9, 0),
        end: new Date(2024, 11, 16, 10, 0),
        resource: {
          type: "task",
          description: "Dachziegel und Rinnenteile beim Händler abholen",
          location: "Baumarkt Schmidt",
          priority: "medium",
          status: "planned",
        },
      },
      {
        id: "3",
        title: "Kundentermin Frau Weber",
        start: new Date(2024, 11, 17, 14, 0),
        end: new Date(2024, 11, 17, 15, 30),
        resource: {
          type: "appointment",
          description: "Kostenvoranschlag für Balkonreparatur",
          location: "Gartenstraße 8, Bremen",
          priority: "medium",
          status: "planned",
        },
      },
      {
        id: "4",
        title: "Projektabgabe Schulze",
        start: new Date(2024, 11, 20, 17, 0),
        end: new Date(2024, 11, 20, 17, 0),
        resource: {
          type: "deadline",
          projectId: "2",
          projectName: "Baustelle Schulze",
          description: "Finale Abnahme und Übergabe",
          priority: "high",
          status: "planned",
        },
      },
    ]

    return NextResponse.json(events)
  } catch (error) {
    console.error("Calendar events error:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Termine" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    const supabase = await createSupabaseServerActionClient()

    // Hier würde normalerweise der Event in die DB gespeichert
    // Für jetzt simulieren wir eine erfolgreiche Erstellung

    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      resource: {
        type: eventData.type,
        projectId: eventData.projectId,
        description: eventData.description,
        location: eventData.location,
        priority: eventData.priority,
        status: "planned",
      },
    }

    return NextResponse.json(newEvent)
  } catch (error) {
    console.error("Create calendar event error:", error)
    return NextResponse.json({ error: "Fehler beim Erstellen des Termins" }, { status: 500 })
  }
}
