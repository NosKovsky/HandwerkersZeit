"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"
import type { Database } from "@/lib/supabase/database.types"

type Project = Database["public"]["Tables"]["projects"]["Row"]
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"]

export async function getProjects(): Promise<Project[]> {
  const supabase = await createSupabaseServerActionClient()
  const { data, error } = await supabase.from("projects").select("*").order("name")
  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }
  return data || []
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createSupabaseServerActionClient()
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()
  if (error) {
    console.error(`Error fetching project ${id}:`, error)
    return null
  }
  return data
}

export async function createProject(
  projectData: Pick<ProjectInsert, "name" | "address" | "description">,
): Promise<{ success: boolean; error?: string; project?: Project }> {
  const supabase = await createSupabaseServerActionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Benutzer nicht authentifiziert." }
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...projectData, created_by: user.id })
    .select()
    .single()

  if (error) {
    console.error("Error creating project:", error)
    return { success: false, error: error.message }
  }
  revalidatePath("/projects")
  return { success: true, project: data }
}

export async function updateProject(
  id: string,
  projectData: Partial<Pick<ProjectInsert, "name" | "address" | "description">>,
): Promise<{ success: boolean; error?: string; project?: Project }> {
  const supabase = await createSupabaseServerActionClient()
  const { data, error } = await supabase.from("projects").update(projectData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating project:", error)
    return { success: false, error: error.message }
  }
  revalidatePath("/projects")
  revalidatePath(`/projects/${id}`)
  return { success: true, project: data }
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerActionClient()
  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    console.error("Error deleting project:", error)
    return { success: false, error: error.message }
  }
  revalidatePath("/projects")
  return { success: true }
}
