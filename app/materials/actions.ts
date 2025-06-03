"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"
import type { Database } from "@/lib/supabase/database.types"

type Material = Database["public"]["Tables"]["materials"]["Row"]
type MaterialInsert = Database["public"]["Tables"]["materials"]["Insert"]

export async function getMaterials(): Promise<Material[]> {
  const supabase = await createSupabaseServerActionClient()
  const { data, error } = await supabase.from("materials").select("*").order("name")
  if (error) {
    console.error("Error fetching materials:", error)
    return []
  }
  return data || []
}

export async function searchMaterials(searchTerm: string): Promise<Material[]> {
  const supabase = await createSupabaseServerActionClient()
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .ilike("name", `%${searchTerm}%`)
    .order("name")
    .limit(10)

  if (error) {
    console.error("Error searching materials:", error)
    return []
  }
  return data || []
}

export async function createMaterial(
  materialData: Pick<MaterialInsert, "name" | "unit" | "description">,
): Promise<{ success: boolean; error?: string; material?: Material }> {
  const supabase = await createSupabaseServerActionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Benutzer nicht authentifiziert." }
  }

  const { data, error } = await supabase
    .from("materials")
    .insert({ ...materialData, created_by: user.id })
    .select()
    .single()

  if (error) {
    console.error("Error creating material:", error)
    return { success: false, error: error.message }
  }
  revalidatePath("/materials")
  return { success: true, material: data }
}

export async function updateMaterial(
  id: string,
  materialData: Partial<Pick<MaterialInsert, "name" | "unit" | "description">>,
): Promise<{ success: boolean; error?: string; material?: Material }> {
  const supabase = await createSupabaseServerActionClient()
  const { data, error } = await supabase.from("materials").update(materialData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating material:", error)
    return { success: false, error: error.message }
  }
  revalidatePath("/materials")
  revalidatePath(`/materials/${id}`)
  return { success: true, material: data }
}

export async function deleteMaterial(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerActionClient()
  const { error } = await supabase.from("materials").delete().eq("id", id)

  if (error) {
    console.error("Error deleting material:", error)
    return { success: false, error: error.message }
  }
  revalidatePath("/materials")
  return { success: true }
}
