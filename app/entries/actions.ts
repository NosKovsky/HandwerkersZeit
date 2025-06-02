"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"
import { uploadFile, deleteFile, STORAGE_BUCKETS } from "@/lib/supabase/storage"
import type { Database } from "@/lib/supabase/database.types"

export type Entry = Database["public"]["Tables"]["entries"]["Row"] & {
  projects?: Database["public"]["Tables"]["projects"]["Row"] | null
  entry_images?: Pick<Database["public"]["Tables"]["entry_images"]["Row"], "id" | "image_path" | "file_name">[]
}
export type EntryInsert = Database["public"]["Tables"]["entries"]["Insert"]
export type EntryImageInsert = Database["public"]["Tables"]["entry_images"]["Insert"]

// Verbesserte getUserProfile Funktion
async function getUserProfile() {
  try {
    const supabase = await createSupabaseServerActionClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error:", userError)
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      return null
    }

    return profile
  } catch (error) {
    console.error("Unexpected error in getUserProfile:", error)
    return null
  }
}

export async function getEntries(filters?: {
  projectId?: string
  dateFrom?: string
  dateTo?: string
}): Promise<Entry[]> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return []

    let query = supabase
      .from("entries")
      .select("*, projects(id, name), entry_images(id, image_path, file_name)")
      .order("entry_date", { ascending: false })
      .order("entry_time", { ascending: false })

    // Sicherheit: Normale Benutzer sehen nur ihre eigenen Einträge
    if (profile.role !== "admin") {
      query = query.eq("user_id", profile.id)
    }

    // Filter anwenden
    if (filters?.projectId) {
      query = query.eq("project_id", filters.projectId)
    }
    if (filters?.dateFrom) {
      query = query.gte("entry_date", filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte("entry_date", filters.dateTo)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching entries:", error)
      throw new Error(`Fehler beim Laden der Einträge: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in getEntries:", error)
    return []
  }
}

export async function getEntryById(id: string): Promise<Entry | null> {
  try {
    if (!id || typeof id !== "string") {
      throw new Error("Ungültige Eintrags-ID")
    }

    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return null

    let query = supabase
      .from("entries")
      .select("*, projects(id, name), entry_images(id, image_path, file_name)")
      .eq("id", id)

    if (profile.role !== "admin") {
      query = query.eq("user_id", profile.id)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Eintrag nicht gefunden
      }
      console.error(`Error fetching entry ${id}:`, error)
      throw new Error(`Fehler beim Laden des Eintrags: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Unexpected error in getEntryById:", error)
    return null
  }
}

export async function createEntry(
  entryData: Omit<EntryInsert, "user_id" | "id" | "created_at" | "updated_at">,
  images?: File[],
): Promise<{ success: boolean; error?: string; entry?: Entry }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Benutzer nicht authentifiziert." }
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

    // Bilder hochladen
    if (images && images.length > 0) {
      const imageInserts: EntryImageInsert[] = []

      for (const file of images) {
        const uploadResult = await uploadFile(STORAGE_BUCKETS.ENTRY_IMAGES, file, user.id)

        if (uploadResult.success && uploadResult.path) {
          imageInserts.push({
            entry_id: newEntry.id,
            user_id: user.id,
            image_path: uploadResult.path,
            file_name: uploadResult.fileName || file.name,
          })
        } else {
          console.error("Image upload failed:", uploadResult.error)
          // Weiter mit anderen Bildern, aber Fehler loggen
        }
      }

      if (imageInserts.length > 0) {
        const { error: imageError } = await supabase.from("entry_images").insert(imageInserts)

        if (imageError) {
          console.error("Error saving entry images:", imageError)
          // Nicht kritisch - Eintrag wurde erstellt
        }
      }
    }

    // Cache invalidieren
    revalidatePath("/entries")
    revalidatePath("/dashboard")
    if (entryData.project_id) {
      revalidatePath(`/projects/${entryData.project_id}`)
    }

    return { success: true, entry: newEntry }
  } catch (error) {
    console.error("Unexpected error in createEntry:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function updateEntry(
  id: string,
  entryData: Partial<Omit<EntryInsert, "user_id" | "id" | "created_at" | "updated_at">>,
  newImages?: File[],
  deletedImageIds?: string[],
): Promise<{ success: boolean; error?: string; entry?: Entry }> {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Ungültige Eintrags-ID." }
    }

    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) {
      return { success: false, error: "Benutzer nicht authentifiziert." }
    }

    // Berechtigung prüfen
    const { data: existingEntry, error: fetchError } = await supabase
      .from("entries")
      .select("user_id, entry_images(id, image_path)")
      .eq("id", id)
      .single()

    if (fetchError || !existingEntry) {
      return { success: false, error: "Eintrag nicht gefunden." }
    }

    if (profile.role !== "admin" && existingEntry.user_id !== profile.id) {
      return { success: false, error: "Keine Berechtigung, diesen Eintrag zu bearbeiten." }
    }

    // Eintrag aktualisieren
    const { data: updatedEntry, error: updateError } = await supabase
      .from("entries")
      .update(entryData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating entry:", updateError)
      return { success: false, error: `Fehler beim Aktualisieren: ${updateError.message}` }
    }

    // Gelöschte Bilder entfernen
    if (deletedImageIds && deletedImageIds.length > 0) {
      // Erst Pfade für Storage-Löschung sammeln
      const { data: imagesToDelete } = await supabase
        .from("entry_images")
        .select("image_path")
        .in("id", deletedImageIds)

      // Aus Datenbank löschen
      const { error: deleteDbError } = await supabase.from("entry_images").delete().in("id", deletedImageIds)

      if (deleteDbError) {
        console.error("Error deleting images from db:", deleteDbError)
      }

      // Aus Storage löschen
      if (imagesToDelete) {
        for (const img of imagesToDelete) {
          if (img.image_path) {
            await deleteFile(STORAGE_BUCKETS.ENTRY_IMAGES, img.image_path)
          }
        }
      }
    }

    // Neue Bilder hinzufügen
    if (newImages && newImages.length > 0) {
      const imageInserts: EntryImageInsert[] = []

      for (const file of newImages) {
        const uploadResult = await uploadFile(STORAGE_BUCKETS.ENTRY_IMAGES, file, profile.id)

        if (uploadResult.success && uploadResult.path) {
          imageInserts.push({
            entry_id: id,
            user_id: profile.id,
            image_path: uploadResult.path,
            file_name: uploadResult.fileName || file.name,
          })
        }
      }

      if (imageInserts.length > 0) {
        const { error: imageError } = await supabase.from("entry_images").insert(imageInserts)

        if (imageError) {
          console.error("Error saving new entry images:", imageError)
        }
      }
    }

    // Cache invalidieren
    revalidatePath("/entries")
    revalidatePath(`/entries/${id}`)
    revalidatePath("/dashboard")
    if (entryData.project_id || updatedEntry?.project_id) {
      revalidatePath(`/projects/${entryData.project_id || updatedEntry?.project_id}`)
    }

    return { success: true, entry: updatedEntry }
  } catch (error) {
    console.error("Unexpected error in updateEntry:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function deleteEntry(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Ungültige Eintrags-ID." }
    }

    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) {
      return { success: false, error: "Benutzer nicht authentifiziert." }
    }

    // Berechtigung prüfen und Bilder laden
    const { data: existingEntry, error: fetchError } = await supabase
      .from("entries")
      .select("user_id, entry_images(image_path)")
      .eq("id", id)
      .single()

    if (fetchError || !existingEntry) {
      return { success: false, error: "Eintrag nicht gefunden." }
    }

    if (profile.role !== "admin" && existingEntry.user_id !== profile.id) {
      return { success: false, error: "Keine Berechtigung, diesen Eintrag zu löschen." }
    }

    // Bilder aus Storage löschen
    if (existingEntry.entry_images) {
      for (const img of existingEntry.entry_images) {
        if (img.image_path) {
          await deleteFile(STORAGE_BUCKETS.ENTRY_IMAGES, img.image_path)
        }
      }
    }

    // Eintrag aus Datenbank löschen (Bilder werden durch CASCADE gelöscht)
    const { error: deleteError } = await supabase.from("entries").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting entry:", deleteError)
      return { success: false, error: `Fehler beim Löschen: ${deleteError.message}` }
    }

    // Cache invalidieren
    revalidatePath("/entries")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error in deleteEntry:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

// Vereinfachte Upload-Funktion für Kompatibilität
export async function uploadEntryImage(
  file: File,
  userId: string,
): Promise<{ success: boolean; error?: string; path?: string; fileName?: string }> {
  return uploadFile(STORAGE_BUCKETS.ENTRY_IMAGES, file, userId)
}
