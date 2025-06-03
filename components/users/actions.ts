"use server"
import { createSupabaseServiceRoleClient } from "@/lib/supabase/actions"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, role: "admin" | "user") {
  try {
    // Benutze den Service Role Client für Admin-Operationen
    const supabase = await createSupabaseServiceRoleClient()

    // Aktualisiere die Rolle in der profiles Tabelle
    const { error } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating user role:", error)
      return { success: false, error: error.message }
    }

    // Revalidiere die Benutzerseite
    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    console.error("Error in updateUserRole:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten",
    }
  }
}
