import * as z from "zod"
import { revalidatePath } from "next/cache"
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server"
import type { EntryPayload, Entry } from "@/types/entry" // Declare EntryPayload and Entry

const entrySchema = z
  .object({
    entry_date: z.string().min(1, "Datum ist erforderlich."),
    entry_time: z.string().min(1, "Startzeit ist erforderlich."), // entry_time statt start_time im Schema
    end_time: z.string().min(1, "Endzeit ist erforderlich.").optional().nullable(), // Optional, wenn es nicht immer gesetzt wird
    project_id: z.string().uuid("Ungültige Baustellen ID.").optional().nullable(),
    activity: z.string().min(3, "Tätigkeit muss mindestens 3 Zeichen haben."),
    notes: z.string().optional().nullable(),
    materials_used: z.string().optional().nullable(), // Als JSON-String
    // user_id wird serverseitig gesetzt
  })
  .refine(
    (data) => {
      if (data.entry_time && data.end_time) {
        return data.entry_time < data.end_time
      }
      return true
    },
    {
      message: "Endzeit muss nach der Startzeit liegen.",
      path: ["end_time"],
    },
  )

// Typ für die Server Action Rückgabe bei Fehlern
interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string | null
  fieldErrors?: Record<string, string[]> // Für detaillierte Feldfehler
}

export async function createEntry(
  entryData: Omit<EntryPayload, "user_id" | "id" | "created_at" | "updated_at">, // EntryPayload anpassen
  imageFiles?: File[],
): Promise<ActionResult<Entry>> {
  // Rückgabetyp anpassen
  const supabase = await createSupabaseServerActionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Nicht authentifiziert" }
  }

  const validationResult = entrySchema.safeParse(entryData)
  if (!validationResult.success) {
    return {
      success: false,
      error: "Validierungsfehler.",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    }
  }

  const validData = validationResult.data

  // ... (Rest der Logik für Bild-Upload und Datenbank-Insert)
  // Verwende validData statt entryData für den Insert
  const { data: newEntry, error } = await supabase
    .from("time_entries") // Deine Tabelle
    .insert({
      ...validData,
      user_id: user.id,
      // materials_used sollte bereits ein JSON-String sein oder hier konvertiert werden
      materials_used: validData.materials_used ? JSON.parse(validData.materials_used) : null,
    })
    .select("*, projects(*), profiles(*), entry_images(*)") // Alle Relationen laden
    .single()

  // ... Fehlerbehandlung und Erfolgsrückgabe
  if (error) {
    console.error("Error creating entry:", error)
    return { success: false, error: error.message }
  }
  if (!newEntry) {
    return { success: false, error: "Eintrag konnte nicht erstellt werden." }
  }
  // ... Bild-Upload Logik hier, falls erfolgreich, dann:
  revalidatePath("/entries")
  revalidatePath(`/baustellen/${newEntry.project_id}`) // Falls relevant
  return { success: true, data: mapDbEntryToEntryType(newEntry) } // mapDbEntryToEntryType erstellen
}

// Ähnliche Anpassungen für updateEntry
export async function updateEntry(
  entryId: string,
  entryData: Partial<EntryPayload>, // EntryPayload anpassen
  newImageFiles?: File[],
  deletedImageIds?: string[],
): Promise<ActionResult<Entry>> {
  // Rückgabetyp anpassen
  const supabase = await createSupabaseServerActionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Nicht authentifiziert" }
  }

  // Nur die übergebenen Felder validieren, oder das ganze Objekt wenn nötig
  const partialSchema = entrySchema.partial() // Erlaubt optionale Felder für Update
  const validationResult = partialSchema.safeParse(entryData)

  if (!validationResult.success) {
    return {
      success: false,
      error: "Validierungsfehler.",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    }
  }
  const validData = validationResult.data
  // ... (Rest der Logik für Bild-Upload/Löschung und Datenbank-Update)
  // Verwende validData für das Update
  const { data: updatedEntry, error } = await supabase
    .from("time_entries")
    .update({
      ...validData,
      // materials_used sollte bereits ein JSON-String sein oder hier konvertiert werden
      materials_used:
        validData.materials_used && typeof validData.materials_used === "string"
          ? JSON.parse(validData.materials_used)
          : validData.materials_used,
    })
    .eq("id", entryId)
    .eq("user_id", user.id) // Sicherstellen, dass nur eigene Einträge geändert werden
    .select("*, projects(*), profiles(*), entry_images(*)")
    .single()
  // ...
  if (error) {
    console.error("Error updating entry:", error)
    return { success: false, error: error.message }
  }
  if (!updatedEntry) {
    return { success: false, error: "Eintrag konnte nicht aktualisiert werden oder nicht gefunden." }
  }

  revalidatePath("/entries")
  revalidatePath(`/entries/${entryId}`)
  revalidatePath(`/baustellen/${updatedEntry.project_id}`)
  return { success: true, data: mapDbEntryToEntryType(updatedEntry) }
}

// Hilfsfunktion zum Mappen des DB-Typs zum UI-Typ (Beispiel)
function mapDbEntryToEntryType(dbEntry: any): Entry {
  return {
    id: dbEntry.id,
    user_id: dbEntry.user_id,
    project_id: dbEntry.project_id,
    entry_date: dbEntry.entry_date,
    entry_time: dbEntry.entry_time,
    end_time: dbEntry.end_time,
    hours: dbEntry.hours,
    activity: dbEntry.activity,
    notes: dbEntry.notes,
    materials_used: dbEntry.materials_used, // Bereits geparst oder bleibt JSON
    created_at: dbEntry.created_at,
    updated_at: dbEntry.updated_at,
    projects: dbEntry.projects,
    profiles: dbEntry.profiles,
    entry_images: dbEntry.entry_images,
    // Mapping für EntryList Komponente
    task_description: dbEntry.activity,
    start_time: `${dbEntry.entry_date}T${dbEntry.entry_time}`,
  }
}

export async function getEntries(
  userId: string,
  projectId?: string,
  startDate?: string,
  endDate?: string,
  searchTerm?: string,
  page = 1,
  pageSize = 10,
): Promise<{ entries: Entry[]; totalCount: number; error?: string }> {
  const supabase = await createSupabaseServerActionClient()

  let query = supabase
    .from("time_entries")
    .select("*, projects(*), profiles(*), entry_images(*)", { count: "exact" })
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .order("entry_time", { ascending: false })

  if (projectId) {
    query = query.eq("project_id", projectId)
  }

  if (startDate) {
    query = query.gte("entry_date", startDate)
  }

  if (endDate) {
    query = query.lte("entry_date", endDate)
  }

  if (searchTerm) {
    query = query.ilike("activity", `%${searchTerm}%`)
  }

  const startIndex = (page - 1) * pageSize
  query = query.range(startIndex, startIndex + pageSize - 1)

  const { data: entries, error, count } = await query

  if (error) {
    console.error("Error fetching entries:", error)
    return { entries: [], totalCount: 0, error: error.message }
  }

  const mappedEntries = entries?.map(mapDbEntryToEntryType) || []

  return { entries: mappedEntries, totalCount: count || 0 }
}

export async function deleteEntry(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerActionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Nicht authentifiziert" }
  }

  const { error } = await supabase.from("time_entries").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Error deleting entry:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/entries")
  return { success: true }
}
