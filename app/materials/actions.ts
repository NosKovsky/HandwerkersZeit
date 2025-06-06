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
  materialData: Pick<MaterialInsert, "name" | "unit" | "description" | "current_stock" | "min_stock" | "unit_price">,
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
  materialData: Partial<
    Pick<MaterialInsert, "name" | "unit" | "description" | "current_stock" | "min_stock" | "unit_price">
  >,
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

// Neue Funktionen für Materialbestand

export async function updateMaterialStock(
  materialId: string,
  quantity: number,
  transactionType: "add" | "remove" | "adjust",
  projectId?: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerActionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Benutzer nicht authentifiziert." }
  }

  const { error } = await supabase.from("material_transactions").insert({
    material_id: materialId,
    project_id: projectId,
    quantity,
    transaction_type: transactionType,
    notes,
    created_by: user.id,
  })

  if (error) {
    console.error("Error updating material stock:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/materials")
  return { success: true }
}

export async function getMaterialTransactions(materialId: string, limit = 10): Promise<any[]> {
  const supabase = await createSupabaseServerActionClient()

  const { data, error } = await supabase
    .from("material_transactions")
    .select(`
      *,
      projects:project_id (name),
      users:created_by (email)
    `)
    .eq("material_id", materialId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching material transactions:", error)
    return []
  }

  return data || []
}

export async function getLowStockMaterials(): Promise<Material[]> {
  const supabase = await createSupabaseServerActionClient()

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .lt("current_stock", supabase.rpc("least", { a: "min_stock", b: 10 }))
    .order("current_stock")

  if (error) {
    console.error("Error fetching low stock materials:", error)
    return []
  }

  return data || []
}
