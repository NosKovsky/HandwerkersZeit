import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { redirect } from "next/navigation"

export type Baustelle = Database["public"]["Tables"]["projects"]["Row"] & {
  profiles: { full_name: string } | null
  customers: {
    id: string
    name: string
    contact_person: string
    city: string
  } | null
}

export type BaustelleInsert = Database["public"]["Tables"]["projects"]["Insert"] & {
  customer_id?: string | null
}

export async function createBaustelle(baustelleData: BaustelleInsert) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: newBaustelle, error: baustelleError } = await supabase
    .from("projects")
    .insert({
      name: baustelleData.name,
      address: baustelleData.address,
      description: baustelleData.description,
      created_by: user.id,
      status: "Aktiv",
      customer_id: baustelleData.customer_id || null,
    })
    .select()
    .single()

  if (baustelleError) {
    console.error(baustelleError)
    return { error: baustelleError.message }
  }

  return { newBaustelle }
}

export async function updateBaustelle(id: string, baustelleData: BaustelleInsert) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: updatedBaustelle, error: updateError } = await supabase
    .from("projects")
    .update({
      name: baustelleData.name,
      address: baustelleData.address,
      description: baustelleData.description,
      customer_id: baustelleData.customer_id || null,
    })
    .eq("id", id)
    .select()
    .single()

  if (updateError) {
    console.error(updateError)
    return { error: updateError.message }
  }

  return { updatedBaustelle }
}

export async function getBaustellen() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data, error } = await supabase
    .from("projects")
    .select(`
    *,
    profiles!projects_created_by_fkey(full_name),
    customers(id, name, contact_person, city)
  `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  return { data }
}

export async function getBaustelleById(id: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data, error } = await supabase
    .from("projects")
    .select(`
    *,
    profiles!projects_created_by_fkey(full_name),
    customers(id, name, contact_person, street, zip_code, city, phone, email)
  `)
    .eq("id", id)
    .single()

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  return { data }
}

export async function deleteBaustelle(id: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  return { success: true }
}
