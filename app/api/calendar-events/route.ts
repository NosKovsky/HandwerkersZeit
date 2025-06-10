import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fallback für leere Datenbank - einfache Mock-Daten
    const calendarEvents = [
      {
        id: "1",
        title: "Beispiel Termin",
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
      },
    ]

    return NextResponse.json(calendarEvents)
  } catch (error) {
    console.error("Calendar events error:", error)
    return NextResponse.json([], { status: 200 }) // Leeres Array statt Fehler
  }
}

export async function POST(request: Request) {
  try {
    const eventData = await request.json()

    // Einfache Bestätigung ohne DB-Zugriff
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
    }

    return NextResponse.json(newEvent)
  } catch (error) {
    console.error("Create calendar event error:", error)
    return NextResponse.json({ error: "Fehler beim Erstellen des Termins" }, { status: 500 })
  }
}
