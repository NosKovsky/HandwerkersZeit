import { createSupabaseServerActionClient } from "./actions"

// Zentrale Storage-Konfiguration
export const STORAGE_BUCKETS = {
  ENTRY_IMAGES: "entryimages",
  RECEIPT_IMAGES: "receiptimages",
} as const

// Hilfsfunktion für Storage URLs
export function getStorageUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ist nicht konfiguriert")
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

// Verbesserte Upload-Funktion mit Fehlerbehandlung
export async function uploadFile(
  bucket: string,
  file: File,
  userId: string,
  folder?: string,
): Promise<{ success: boolean; error?: string; path?: string; fileName?: string }> {
  try {
    const supabase = await createSupabaseServerActionClient()

    // Validierung
    if (!file || file.size === 0) {
      return { success: false, error: "Keine gültige Datei ausgewählt" }
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB Limit
      return { success: false, error: "Datei ist zu groß (max. 10MB)" }
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Dateityp nicht unterstützt" }
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileName = folder
      ? `${folder}/${userId}/${timestamp}-${randomId}.${fileExt}`
      : `${userId}/${timestamp}-${randomId}.${fileExt}`

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Storage upload error:", error)
      return { success: false, error: `Upload fehlgeschlagen: ${error.message}` }
    }

    return {
      success: true,
      path: data.path,
      fileName: file.name,
    }
  } catch (error) {
    console.error("Unexpected upload error:", error)
    return { success: false, error: "Unerwarteter Fehler beim Upload" }
  }
}

// Verbesserte Delete-Funktion
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error("Storage delete error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected delete error:", error)
    return false
  }
}
