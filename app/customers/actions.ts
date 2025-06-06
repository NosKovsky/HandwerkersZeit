import { revalidatePath } from "next/cache"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"
import type { Database } from "@/lib/supabase/database.types"

export type Customer = Database["public"]["Tables"]["customers"]["Row"]
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"]

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

export async function getCustomers(): Promise<Customer[]> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return []

    const { data, error } = await supabase.from("customers").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching customers:", error)
      throw new Error(`Fehler beim Laden der Kunden: ${error.message}`)
    }
    return data || []
  } catch (error) {
    console.error("Unexpected error in getCustomers:", error)
    return []
  }
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    if (!query || query.trim().length < 2) return []

    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return []

    const searchTerm = `%${query.trim()}%`

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .or(
        `name.ilike.${searchTerm},contact_person.ilike.${searchTerm},street.ilike.${searchTerm},city.ilike.${searchTerm},zip_code.ilike.${searchTerm}`,
      )
      .order("name", { ascending: true })
      .limit(10)

    if (error) {
      console.error("Error searching customers:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Unexpected error in searchCustomers:", error)
    return []
  }
}

export async function createCustomer(
  customerData: Omit<CustomerInsert, "id" | "created_at" | "updated_at">,
): Promise<{ success: boolean; error?: string; customer?: Customer }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return { success: false, error: "Benutzer nicht authentifiziert." }

    if (!customerData.name || customerData.name.trim().length < 2) {
      return { success: false, error: "Kundenname muss mindestens 2 Zeichen haben." }
    }

    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert(customerData)
      .select()
      .single()

    if (customerError) {
      console.error("Error creating customer:", customerError)
      return { success: false, error: `Fehler beim Erstellen des Kunden: ${customerError.message}` }
    }

    revalidatePath("/customers")
    return { success: true, customer: newCustomer }
  } catch (error) {
    console.error("Unexpected error in createCustomer:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function updateCustomer(
  id: string,
  customerData: Partial<Omit<CustomerInsert, "id" | "created_at" | "updated_at">>,
): Promise<{ success: boolean; error?: string; customer?: Customer }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return { success: false, error: "Benutzer nicht authentifiziert." }

    const { data: updatedCustomer, error: updateError } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating customer:", updateError)
      return { success: false, error: `Fehler beim Aktualisieren: ${updateError.message}` }
    }

    revalidatePath("/customers")
    return { success: true, customer: updatedCustomer }
  } catch (error) {
    console.error("Unexpected error in updateCustomer:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return { success: false, error: "Benutzer nicht authentifiziert." }

    // Prüfen ob Kunde noch mit Baustellen verknüpft ist
    const { data: linkedProjects } = await supabase.from("projects").select("id").eq("customer_id", id).limit(1)

    if (linkedProjects && linkedProjects.length > 0) {
      return { success: false, error: "Kunde kann nicht gelöscht werden, da er noch mit Baustellen verknüpft ist." }
    }

    const { error: deleteError } = await supabase.from("customers").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting customer:", deleteError)
      return { success: false, error: `Fehler beim Löschen: ${deleteError.message}` }
    }

    revalidatePath("/customers")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in deleteCustomer:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}
