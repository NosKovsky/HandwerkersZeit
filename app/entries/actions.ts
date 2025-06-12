"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server"

export type Entry = {
  id: string
  user_id: string
  project_id: string | null
  entry_date: string
  entry_time: string
  end_time: string | null
  activity: string
  notes: string | null
  materials_used: any
  created_at: string
  updated_at: string
  projects?: {
    id: string
    name: string
  } | null
  entry_images?: {
    id: string
    image_path: string
    file_name: string
  }[]
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
  try {
    const supabase = await createSupabaseServerActionClient()

    let query = supabase
      .from("entries")
      .select(
        `
        *,
        projects (
          id,
          name
        ),
        entry_images (
          id,
          image_path,
          file_name
        )
      `,
        { count: "exact" },
      )
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

    return { entries: entries || [], totalCount: count || 0 }
  } catch (error) {
    console.error("Unexpected error in getEntries:", error)
    return { entries: [], totalCount: 0, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function createEntry(
  entryData: {
    entry_date: string
    entry_time: string
    end_time?: string | null
    project_id?: string | null
    activity: string
    notes?: string | null
    materials_used?: any
  },
  imageFiles?: File[],
): Promise<{ success: boolean; error?: string; entry?: Entry }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Nicht authentifiziert" }
    }

    // Validierung
    if (!entryData.activity || entryData.activity.trim().length < 3) {
      return { success: false, error: "Tätigkeit muss mindestens 3 Zeichen haben." }
    }

    if (!entryData.entry_date || !entryData.entry_time) {
      return { success: false, error: "Datum und Uhrzeit sind erforderlich." }
    }

    // Eintrag erstellen
    const { data: newEntry, error: entryError } = await supabase
      .from("entries")
      .insert({ ...entryData, user_id: user.id })
      .select()
      .single()

    if (entryError) {
      console.error("Error creating entry:", entryError)
      return { success: false, error: `Fehler beim Erstellen: ${entryError.message}` }
    }

    // Cache invalidieren
    revalidatePath("/entries")
    revalidatePath("/dashboard")

    return { success: true, entry: newEntry }
  } catch (error) {
    console.error("Unexpected error in createEntry:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function updateEntry(
  entryId: string,
  entryData: Partial<{
    entry_date: string
    entry_time: string
    end_time: string | null
    project_id: string | null
    activity: string
    notes: string | null
    materials_used: any
  }>,
  newImageFiles?: File[],
  deletedImageIds?: string[],
): Promise<{ success: boolean; error?: string; entry?: Entry }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Nicht authentifiziert" }
    }

    // Validierung
    if (entryData.activity && entryData.activity.trim().length < 3) {
      return { success: false, error: "Tätigkeit muss mindestens 3 Zeichen haben." }
    }

    // Eintrag aktualisieren
    const { data: updatedEntry, error: updateError } = await supabase
      .from("entries")
      .update(entryData)
      .eq("id", entryId)
      .eq("user_id", user.id)
      .select(
        `
        *,
        projects (
          id,
          name
        ),
        entry_images (
          id,
          image_path,
          file_name
        )
      `,
      )
      .single()

    if (updateError) {
      console.error("Error updating entry:", updateError)
      return { success: false, error: `Fehler beim Aktualisieren: ${updateError.message}` }
    }

    if (!updatedEntry) {
      return { success: false, error: "Eintrag nicht gefunden oder keine Berechtigung." }
    }

    // Gelöschte Bilder entfernen
    if (deletedImageIds && deletedImageIds.length > 0) {
      const { error: deleteImagesError } = await supabase
        .from("entry_images")
        .delete()
        .in("id", deletedImageIds)
        .eq("entry_id", entryId)

      if (deleteImagesError) {
        console.error("Error deleting images:", deleteImagesError)
      }
    }

    // Neue Bilder hinzufügen (falls implementiert)
    if (newImageFiles && newImageFiles.length > 0) {
      // TODO: Implementierung für Bild-Upload
      console.log("New image files to upload:", newImageFiles.length)
    }

    // Cache invalidieren
    revalidatePath("/entries")
    revalidatePath("/dashboard")
    revalidatePath(`/entries/${entryId}`)

    return { success: true, entry: updatedEntry }
  } catch (error) {
    console.error("Unexpected error in updateEntry:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function deleteEntry(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Nicht authentifiziert" }
    }

    // Zuerst die zugehörigen Bilder löschen
    const { error: deleteImagesError } = await supabase.from("entry_images").delete().eq("entry_id", id)

    if (deleteImagesError) {
      console.error("Error deleting entry images:", deleteImagesError)
    }

    // Dann den Eintrag löschen
    const { error } = await supabase.from("entries").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting entry:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/entries")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in deleteEntry:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function getEntryById(id: string): Promise<{ entry: Entry | null; error?: string }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { entry: null, error: "Nicht authentifiziert" }
    }

    const { data: entry, error } = await supabase
      .from("entries")
      .select(
        `
        *,
        projects (
          id,
          name
        ),
        entry_images (
          id,
          image_path,
          file_name
        )
      `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Error fetching entry:", error)
      return { entry: null, error: error.message }
    }

    return { entry }
  } catch (error) {
    console.error("Unexpected error in getEntryById:", error)
    return { entry: null, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function startWorkTime(
  projectId: string,
  startTime: string,
  notes?: string,
): Promise<{ success: boolean; error?: string; entry?: Entry }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Nicht authentifiziert" }
    }

    const today = new Date().toISOString().split("T")[0]

    const { data: newEntry, error: insertError } = await supabase
      .from("entries")
      .insert({
        user_id: user.id,
        project_id: projectId,
        entry_date: today,
        entry_time: startTime,
        notes: notes || null,
      })
      .select(
        `
        *,
        projects (id, name),
        entry_images (id, image_path, file_name)
      `,
      )
      .single()

    if (insertError) {
      console.error("Error starting work time:", insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath("/entries")
    revalidatePath("/dashboard")
    return { success: true, entry: newEntry as Entry }
  } catch (error) {
    console.error("Unexpected error in startWorkTime:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

// Hilfsfunktion für Arbeitszeit-Ende
export async function endWorkTime(
  projectId: string,
  endTime: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Nicht authentifiziert" }
    }

    const today = new Date().toISOString().split("T")[0]

    // Finde den letzten offenen Eintrag für heute
    const { data: openEntry, error: findError } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .eq("entry_date", today)
      .is("end_time", null)
      .order("entry_time", { ascending: false })
      .limit(1)
      .single()

    if (findError || !openEntry) {
      return { success: false, error: "Kein offener Arbeitseintrag für heute gefunden." }
    }

    // Aktualisiere den Eintrag mit der Endzeit
    const updateData: any = { end_time: endTime }
    if (notes) {
      updateData.notes = notes
    }

    const { error: updateError } = await supabase.from("entries").update(updateData).eq("id", openEntry.id)

    if (updateError) {
      console.error("Error ending work time:", updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath("/entries")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in endWorkTime:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}
