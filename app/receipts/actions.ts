"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"
import { uploadFile, deleteFile, STORAGE_BUCKETS } from "@/lib/supabase/storage"
import type { Database } from "@/lib/supabase/database.types"

export type Receipt = Database["public"]["Tables"]["receipts"]["Row"] & {
  projects?: Pick<Database["public"]["Tables"]["projects"]["Row"], "id" | "name"> | null
}
export type ReceiptInsert = Database["public"]["Tables"]["receipts"]["Insert"]

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

export async function getReceipts(filters?: {
  projectId?: string
  dateFrom?: string
  dateTo?: string
  category?: string
}): Promise<Receipt[]> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return []

    let query = supabase.from("receipts").select("*, projects(id, name)").order("receipt_date", { ascending: false })

    if (profile.role !== "admin") {
      query = query.eq("user_id", profile.id)
    }

    if (filters?.projectId) {
      query = query.eq("project_id", filters.projectId)
    }
    if (filters?.dateFrom) {
      query = query.gte("receipt_date", filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte("receipt_date", filters.dateTo)
    }
    if (filters?.category) {
      query = query.eq("category", filters.category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching receipts:", error)
      throw new Error(`Fehler beim Laden der Quittungen: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in getReceipts:", error)
    return []
  }
}

export async function getReceiptById(id: string): Promise<Receipt | null> {
  try {
    if (!id || typeof id !== "string") {
      throw new Error("Ungültige Quittungs-ID")
    }

    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return null

    let query = supabase.from("receipts").select("*, projects(id, name)").eq("id", id)

    if (profile.role !== "admin") {
      query = query.eq("user_id", profile.id)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Quittung nicht gefunden
      }
      console.error(`Error fetching receipt ${id}:`, error)
      throw new Error(`Fehler beim Laden der Quittung: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Unexpected error in getReceiptById:", error)
    return null
  }
}

export async function createReceipt(
  receiptData: Omit<ReceiptInsert, "user_id" | "id" | "created_at" | "updated_at" | "image_path">,
  imageFile?: File,
): Promise<{ success: boolean; error?: string; receipt?: Receipt }> {
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
    if (!receiptData.amount || receiptData.amount <= 0) {
      return { success: false, error: "Betrag muss größer als 0 sein." }
    }

    if (!receiptData.receipt_date) {
      return { success: false, error: "Datum ist erforderlich." }
    }

    let imagePath: string | undefined = undefined

    // Bild hochladen falls vorhanden
    if (imageFile) {
      const uploadResult = await uploadFile(STORAGE_BUCKETS.RECEIPT_IMAGES, imageFile, user.id, "receipts")

      if (uploadResult.success && uploadResult.path) {
        imagePath = uploadResult.path
      } else {
        return { success: false, error: uploadResult.error || "Fehler beim Hochladen des Bildes" }
      }
    }

    // Quittung erstellen
    const { data: newReceipt, error: receiptError } = await supabase
      .from("receipts")
      .insert({ ...receiptData, user_id: user.id, image_path: imagePath })
      .select("*, projects(id, name)")
      .single()

    if (receiptError) {
      console.error("Error creating receipt:", receiptError)
      // Bei Fehler hochgeladenes Bild wieder löschen
      if (imagePath) {
        await deleteFile(STORAGE_BUCKETS.RECEIPT_IMAGES, imagePath)
      }
      return { success: false, error: `Fehler beim Erstellen: ${receiptError.message}` }
    }

    // Cache invalidieren
    revalidatePath("/receipts")
    if (receiptData.project_id) {
      revalidatePath(`/projects/${receiptData.project_id}`)
    }

    return { success: true, receipt: newReceipt }
  } catch (error) {
    console.error("Unexpected error in createReceipt:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function updateReceipt(
  id: string,
  receiptData: Partial<Omit<ReceiptInsert, "user_id" | "id" | "created_at" | "updated_at" | "image_path">>,
  imageFile?: File,
  deleteExistingImage?: boolean,
): Promise<{ success: boolean; error?: string; receipt?: Receipt }> {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Ungültige Quittungs-ID." }
    }

    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) {
      return { success: false, error: "Benutzer nicht authentifiziert." }
    }

    // Berechtigung prüfen
    const { data: existingReceipt, error: fetchError } = await supabase
      .from("receipts")
      .select("user_id, image_path")
      .eq("id", id)
      .single()

    if (fetchError || !existingReceipt) {
      return { success: false, error: "Quittung nicht gefunden." }
    }

    if (profile.role !== "admin" && existingReceipt.user_id !== profile.id) {
      return { success: false, error: "Keine Berechtigung, diese Quittung zu bearbeiten." }
    }

    let imagePath = existingReceipt.image_path

    // Bildverwaltung
    if (imageFile) {
      // Altes Bild löschen falls vorhanden
      if (existingReceipt.image_path) {
        await deleteFile(STORAGE_BUCKETS.RECEIPT_IMAGES, existingReceipt.image_path)
      }

      // Neues Bild hochladen
      const uploadResult = await uploadFile(STORAGE_BUCKETS.RECEIPT_IMAGES, imageFile, profile.id, "receipts")

      if (uploadResult.success && uploadResult.path) {
        imagePath = uploadResult.path
      } else {
        return { success: false, error: uploadResult.error || "Fehler beim Hochladen des Bildes" }
      }
    } else if (deleteExistingImage && existingReceipt.image_path) {
      // Bestehendes Bild löschen
      await deleteFile(STORAGE_BUCKETS.RECEIPT_IMAGES, existingReceipt.image_path)
      imagePath = null
    }

    // Quittung aktualisieren
    const { data: updatedReceipt, error: updateError } = await supabase
      .from("receipts")
      .update({ ...receiptData, image_path: imagePath })
      .eq("id", id)
      .select("*, projects(id, name)")
      .single()

    if (updateError) {
      console.error("Error updating receipt:", updateError)
      return { success: false, error: `Fehler beim Aktualisieren: ${updateError.message}` }
    }

    // Cache invalidieren
    revalidatePath("/receipts")
    revalidatePath(`/receipts/${id}`)
    if (receiptData.project_id || updatedReceipt?.project_id) {
      revalidatePath(`/projects/${receiptData.project_id || updatedReceipt?.project_id}`)
    }

    return { success: true, receipt: updatedReceipt }
  } catch (error) {
    console.error("Unexpected error in updateReceipt:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function deleteReceipt(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Ungültige Quittungs-ID." }
    }

    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) {
      return { success: false, error: "Benutzer nicht authentifiziert." }
    }

    // Berechtigung prüfen
    const { data: existingReceipt, error: fetchError } = await supabase
      .from("receipts")
      .select("user_id, image_path")
      .eq("id", id)
      .single()

    if (fetchError || !existingReceipt) {
      return { success: false, error: "Quittung nicht gefunden." }
    }

    if (profile.role !== "admin" && existingReceipt.user_id !== profile.id) {
      return { success: false, error: "Keine Berechtigung, diese Quittung zu löschen." }
    }

    // Bild aus Storage löschen
    if (existingReceipt.image_path) {
      await deleteFile(STORAGE_BUCKETS.RECEIPT_IMAGES, existingReceipt.image_path)
    }

    // Quittung aus Datenbank löschen
    const { error: deleteError } = await supabase.from("receipts").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting receipt:", deleteError)
      return { success: false, error: `Fehler beim Löschen: ${deleteError.message}` }
    }

    // Cache invalidieren
    revalidatePath("/receipts")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error in deleteReceipt:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}
