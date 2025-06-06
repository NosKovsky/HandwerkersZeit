"use client"

import { useState, useEffect } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { de } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, CalendarIcon, Clock, MapPin } from "lucide-react"
import { toast } from "sonner"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { de },
})

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    type: "project" | "task" | "appointment" | "deadline"
    projectId?: string
    projectName?: string
    description?: string
    location?: string
    assignedTo?: string[]
    priority?: "low" | "medium" | "high"
    status?: "planned" | "in-progress" | "completed" | "cancelled"
  }
}

interface NewEventForm {
  title: string
  start: string
  end: string
  startTime: string
  endTime: string
  type: "project" | "task" | "appointment" | "deadline"
  projectId: string
  description: string
  location: string
  priority: "low" | "medium" | "high"
}

export function ProjectCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showNewEventDialog, setShowNewEventDialog] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newEvent, setNewEvent] = useState<NewEventForm>({
    title: "",
    start: "",
    end: "",
    startTime: "08:00",
    endTime: "17:00",
    type: "task",
    projectId: "defaultProjectId", // Updated default value
    description: "",
    location: "",
    priority: "medium",
  })

  useEffect(() => {
    loadCalendarData()
  }, [])

  const loadCalendarData = async () => {
    setLoading(true)
    try {
      // Projekte laden
      const projectsResponse = await fetch("/api/projects")
      const projectsData = await projectsResponse.json()
      setProjects(projectsData)

      // Kalender-Events laden
      const eventsResponse = await fetch("/api/calendar-events")
      const eventsData = await eventsResponse.json()

      const formattedEvents = eventsData.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))

      setEvents(formattedEvents)
    } catch (error) {
      console.error("Error loading calendar data:", error)
      toast.error("Fehler beim Laden der Kalenderdaten")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setNewEvent({
      ...newEvent,
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
      startTime: format(start, "HH:mm"),
      endTime: format(end, "HH:mm"),
    })
    setShowNewEventDialog(true)
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const createEvent = async () => {
    try {
      const startDateTime = new Date(`${newEvent.start}T${newEvent.startTime}`)
      const endDateTime = new Date(`${newEvent.end}T${newEvent.endTime}`)

      const eventData = {
        title: newEvent.title,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        type: newEvent.type,
        projectId: newEvent.projectId || null,
        description: newEvent.description,
        location: newEvent.location,
        priority: newEvent.priority,
      }

      const response = await fetch("/api/calendar-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) throw new Error("Fehler beim Erstellen des Termins")

      toast.success("Termin erfolgreich erstellt!")
      setShowNewEventDialog(false)
      setNewEvent({
        title: "",
        start: "",
        end: "",
        startTime: "08:00",
        endTime: "17:00",
        type: "task",
        projectId: "defaultProjectId", // Updated default value
        description: "",
        location: "",
        priority: "medium",
      })
      loadCalendarData()
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("Fehler beim Erstellen des Termins")
    }
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3174ad"

    switch (event.resource.type) {
      case "project":
        backgroundColor = "#10B981"
        break
      case "task":
        backgroundColor = "#3B82F6"
        break
      case "appointment":
        backgroundColor = "#8B5CF6"
        break
      case "deadline":
        backgroundColor = "#EF4444"
        break
    }

    if (event.resource.priority === "high") {
      backgroundColor = "#DC2626"
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "project":
        return "🏗️"
      case "task":
        return "📋"
      case "appointment":
        return "👥"
      case "deadline":
        return "⚠️"
      default:
        return "📅"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Kalender...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl flex items-center gap-3">
                <CalendarIcon className="h-8 w-8" />
                Projekt-Kalender
              </CardTitle>
              <CardDescription className="text-lg">Planen Sie Ihre Projekte, Aufgaben und Termine</CardDescription>
            </div>
            <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Termin
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Neuen Termin erstellen</DialogTitle>
                  <DialogDescription>Fügen Sie einen neuen Termin zu Ihrem Kalender hinzu</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Termin-Titel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Typ</Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value: any) => setNewEvent({ ...newEvent, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project">🏗️ Projekt</SelectItem>
                        <SelectItem value="task">📋 Aufgabe</SelectItem>
                        <SelectItem value="appointment">👥 Termin</SelectItem>
                        <SelectItem value="deadline">⚠️ Deadline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start">Startdatum</Label>
                    <Input
                      id="start"
                      type="date"
                      value={newEvent.start}
                      onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">Enddatum</Label>
                    <Input
                      id="end"
                      type="date"
                      value={newEvent.end}
                      onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Startzeit</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Endzeit</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Projekt</Label>
                    <Select
                      value={newEvent.projectId}
                      onValueChange={(value) => setNewEvent({ ...newEvent, projectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Projekt auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="defaultProjectId">Kein Projekt</SelectItem> {/* Updated value */}
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorität</Label>
                    <Select
                      value={newEvent.priority}
                      onValueChange={(value: any) => setNewEvent({ ...newEvent, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">📝 Niedrig</SelectItem>
                        <SelectItem value="medium">⚡ Mittel</SelectItem>
                        <SelectItem value="high">🔥 Hoch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Ort</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="Adresse oder Ort"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Zusätzliche Details..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowNewEventDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={createEvent} disabled={!newEvent.title}>
                    Termin erstellen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Kalender */}
      <Card>
        <CardContent className="p-6">
          <div style={{ height: "600px" }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventStyleGetter}
              views={["month", "week", "day", "agenda"]}
              defaultView="month"
              messages={{
                next: "Weiter",
                previous: "Zurück",
                today: "Heute",
                month: "Monat",
                week: "Woche",
                day: "Tag",
                agenda: "Agenda",
                date: "Datum",
                time: "Zeit",
                event: "Termin",
                noEventsInRange: "Keine Termine in diesem Zeitraum",
                showMore: (total) => `+ ${total} weitere`,
              }}
              formats={{
                monthHeaderFormat: (date) => format(date, "MMMM yyyy", { locale: de }),
                dayHeaderFormat: (date) => format(date, "EEEE, dd.MM.yyyy", { locale: de }),
                dayRangeHeaderFormat: ({ start, end }) =>
                  `${format(start, "dd.MM", { locale: de })} - ${format(end, "dd.MM.yyyy", { locale: de })}`,
                agendaDateFormat: (date) => format(date, "EEE dd.MM", { locale: de }),
                agendaTimeFormat: (date) => format(date, "HH:mm", { locale: de }),
                agendaTimeRangeFormat: ({ start, end }) =>
                  `${format(start, "HH:mm", { locale: de })} - ${format(end, "HH:mm", { locale: de })}`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-2xl">{getEventIcon(selectedEvent.resource.type)}</span>
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription>Termin-Details</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basis-Informationen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Typ</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEventIcon(selectedEvent.resource.type)}</span>
                    <span className="capitalize">{selectedEvent.resource.type}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Priorität</Label>
                  <Badge variant={getPriorityColor(selectedEvent.resource.priority || "medium")}>
                    {selectedEvent.resource.priority === "high"
                      ? "🔥 Hoch"
                      : selectedEvent.resource.priority === "medium"
                        ? "⚡ Mittel"
                        : "📝 Niedrig"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Datum & Zeit</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      {format(selectedEvent.start, "dd.MM.yyyy HH:mm", { locale: de })} -
                      {format(selectedEvent.end, "HH:mm", { locale: de })}
                    </span>
                  </div>
                </div>
                {selectedEvent.resource.location && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Ort</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{selectedEvent.resource.location}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Projekt-Information */}
              {selectedEvent.resource.projectName && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Projekt</Label>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="font-medium text-blue-900">{selectedEvent.resource.projectName}</span>
                  </div>
                </div>
              )}

              {/* Beschreibung */}
              {selectedEvent.resource.description && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Beschreibung</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-700">{selectedEvent.resource.description}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <Badge
                  variant={
                    selectedEvent.resource.status === "completed"
                      ? "default"
                      : selectedEvent.resource.status === "in-progress"
                        ? "secondary"
                        : selectedEvent.resource.status === "cancelled"
                          ? "destructive"
                          : "outline"
                  }
                >
                  {selectedEvent.resource.status === "completed"
                    ? "✅ Abgeschlossen"
                    : selectedEvent.resource.status === "in-progress"
                      ? "🔄 In Bearbeitung"
                      : selectedEvent.resource.status === "cancelled"
                        ? "❌ Abgebrochen"
                        : "📅 Geplant"}
                </Badge>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Schließen
              </Button>
              <Button>Bearbeiten</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
