"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { redirect } from "next/navigation"

export type ExportFormat = "csv" | "excel" | "pdf"

export type ExportOptions = {
  projectId: string
  includeEntries?: boolean
  includeMaterials?: boolean
  includeImages?: boolean
  includeTodos?: boolean
  dateRange?: {
    from: string
    to: string
  }
  format: ExportFormat
}

export async function exportBaustellenData(options: ExportOptions) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Baustelle abrufen
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(`
      *,
      profiles!projects_created_by_fkey(full_name),
      customers(id, name, contact_person, street, zip_code, city, phone, email)
    `)
    .eq("id", options.projectId)
    .single()

  if (projectError || !project) {
    console.error("Error fetching project:", projectError)
    return { error: "Baustelle konnte nicht gefunden werden." }
  }

  // Einträge abrufen, wenn gewünscht
  let entries = []
  if (options.includeEntries) {
    const query = supabase
      .from("entries")
      .select(`
        *,
        profiles!entries_user_id_fkey(full_name)
      `)
      .eq("project_id", options.projectId)
      .order("entry_date", { ascending: false })

    // Datumsfilter hinzufügen, wenn vorhanden
    if (options.dateRange) {
      query.gte("entry_date", options.dateRange.from)
      query.lte("entry_date", options.dateRange.to)
    }

    const { data: entriesData, error: entriesError } = await query

    if (entriesError) {
      console.error("Error fetching entries:", entriesError)
      return { error: "Einträge konnten nicht abgerufen werden." }
    }

    entries = entriesData || []
  }

  // To-Dos abrufen, wenn gewünscht
  let todos = []
  if (options.includeTodos) {
    const { data: todosData, error: todosError } = await supabase
      .from("project_todos")
      .select(`
        *,
        profiles!project_todos_created_by_fkey(full_name)
      `)
      .eq("project_id", options.projectId)
      .order("created_at", { ascending: false })

    if (todosError) {
      console.error("Error fetching todos:", todosError)
      return { error: "Aufgaben konnten nicht abgerufen werden." }
    }

    todos = todosData || []
  }

  // Daten für den Export vorbereiten
  const exportData = {
    project: {
      id: project.id,
      name: project.name,
      address: project.address,
      description: project.description,
      status: project.status,
      created_at: project.created_at,
      created_by: project.profiles?.full_name || "Unbekannt",
      customer: project.customers
        ? {
            name: project.customers.name,
            contact_person: project.customers.contact_person,
            address:
              `${project.customers.street || ""}, ${project.customers.zip_code || ""} ${project.customers.city || ""}`.trim(),
            phone: project.customers.phone,
            email: project.customers.email,
          }
        : null,
    },
    entries: entries.map((entry: any) => ({
      date: entry.entry_date,
      start_time: entry.entry_time,
      end_time: entry.end_time || "",
      duration: calculateDuration(entry.entry_time, entry.end_time),
      activity: entry.activity,
      notes: entry.notes || "",
      worker: entry.profiles?.full_name || "Unbekannt",
      materials: entry.materials_used ? formatMaterials(entry.materials_used) : "",
    })),
    todos: todos.map((todo: any) => ({
      content: todo.content,
      status: todo.is_completed ? "Erledigt" : "Offen",
      created_by: todo.profiles?.full_name || "Unbekannt",
      created_at: formatDate(todo.created_at),
      completed_at: todo.completed_at ? formatDate(todo.completed_at) : "",
    })),
  }

  // CSV-Format generieren
  if (options.format === "csv") {
    const csvContent = generateCSV(exportData)
    return {
      success: true,
      data: csvContent,
      filename: `baustelle-${project.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${formatDateForFilename(new Date())}.csv`,
    }
  }

  // Excel und PDF sind komplexer und würden in einer realen Anwendung
  // mit entsprechenden Bibliotheken implementiert werden
  return { error: `Format ${options.format} wird noch nicht unterstützt.` }
}

// Hilfsfunktionen
function calculateDuration(startTime: string, endTime: string | null): string {
  if (!endTime) return "0:00"

  const start = new Date(`1970-01-01T${startTime}`)
  const end = new Date(`1970-01-01T${endTime}`)

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return "0:00"

  const diffMs = end.getTime() - start.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}:${minutes.toString().padStart(2, "0")}`
}

function formatMaterials(materialsJson: any): string {
  try {
    const materials = typeof materialsJson === "string" ? JSON.parse(materialsJson) : materialsJson
    return materials.map((m: any) => `${m.quantity} ${m.unit || ""} ${m.name}`).join("; ")
  } catch (e) {
    console.error("Error parsing materials:", e)
    return ""
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("de-DE")
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split("T")[0]
}

function generateCSV(data: any): string {
  let csv = "\uFEFF" // BOM für UTF-8

  // Projektinformationen
  csv += "Baustelleninformationen\n"
  csv += `Name;${data.project.name}\n`
  csv += `Adresse;${data.project.address || ""}\n`
  csv += `Status;${data.project.status || ""}\n`
  csv += `Beschreibung;${(data.project.description || "").replace(/\n/g, " ")}\n`
  csv += `Erstellt von;${data.project.created_by}\n`
  csv += `Erstellt am;${formatDate(data.project.created_at)}\n\n`

  // Kundeninformationen, falls vorhanden
  if (data.project.customer) {
    csv += "Kundeninformationen\n"
    csv += `Name;${data.project.customer.name}\n`
    csv += `Ansprechpartner;${data.project.customer.contact_person || ""}\n`
    csv += `Adresse;${data.project.customer.address || ""}\n`
    csv += `Telefon;${data.project.customer.phone || ""}\n`
    csv += `E-Mail;${data.project.customer.email || ""}\n\n`
  }

  // Einträge, falls vorhanden
  if (data.entries.length > 0) {
    csv += "Einträge\n"
    csv += "Datum;Startzeit;Endzeit;Dauer;Tätigkeit;Notizen;Mitarbeiter;Materialien\n"

    data.entries.forEach((entry: any) => {
      csv += `${entry.date};${entry.start_time};${entry.end_time};${entry.duration};`
      csv += `"${entry.activity.replace(/"/g, '""')}";`
      csv += `"${(entry.notes || "").replace(/"/g, '""')}";`
      csv += `${entry.worker};`
      csv += `"${(entry.materials || "").replace(/"/g, '""')}"\n`
    })

    csv += "\n"
  }

  // To-Dos, falls vorhanden
  if (data.todos.length > 0) {
    csv += "Aufgaben\n"
    csv += "Aufgabe;Status;Erstellt von;Erstellt am;Erledigt am\n"

    data.todos.forEach((todo: any) => {
      csv += `"${todo.content.replace(/"/g, '""')}";`
      csv += `${todo.status};`
      csv += `${todo.created_by};`
      csv += `${todo.created_at};`
      csv += `${todo.completed_at}\n`
    })
  }

  return csv
}
