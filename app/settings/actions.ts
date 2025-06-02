"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"
import type { PostgrestError } from "@supabase/supabase-js"

export async function updateProfileName(
  fullName: string,
): Promise<{ success: boolean; error?: string | PostgrestError }> {
  const supabase = await createSupabaseServerActionClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Benutzer nicht authentifiziert." }
  }

  // Update in auth.users (user_metadata)
  const { error: authUpdateError } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  })

  if (authUpdateError) {
    console.error("Error updating user metadata:", authUpdateError)
    return { success: false, error: authUpdateError }
  }

  // Update in public.profiles table
  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id)

  if (profileUpdateError) {
    console.error("Error updating profile table:", profileUpdateError)
    // Ggf. Rollback für auth.updateUser, falls kritisch
    return { success: false, error: profileUpdateError }
  }

  revalidatePath("/settings")
  revalidatePath("/dashboard") // Wo der Name angezeigt wird
  // Revalidate alle Layouts/Komponenten, die den Namen verwenden
  return { success: true }
}
