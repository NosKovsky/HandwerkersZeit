"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerActionClient, createSupabaseServiceRoleClient } from "@/lib/supabase/actions"
import type { Database } from "@/lib/supabase/database.types"

type Project = Database["public"]["Tables"]["projects"]["Row"]
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"]

// Hilfsfunktion zur Überprüfung der Admin-Rolle
async function isAdminUser() {
  const supabase = await createSupabaseServerActionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  return profile?.role === "admin"
}

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
  if (!(await isAdminUser())) {
    return { success: false, error: "Nur Administratoren können Projekte erstellen." }
  }

  const supabase = await createSupabaseServerActionClient() // oder ServiceRoleClient, wenn RLS komplexer ist
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
  revalidatePath("/admin/projects") // Falls es eine separate Admin-Seite gibt
  return { success: true, project: data }
}

export async function updateProject(
  id: string,
  projectData: Partial<Pick<ProjectInsert, "name" | "address" | "description">>,
): Promise<{ success: boolean; error?: string; project?: Project }> {
  if (!(await isAdminUser())) {
    return { success: false, error: "Nur Administratoren können Projekte bearbeiten." }
  }
  const supabase = await createSupabaseServerActionClient()
  const { data, error } = await supabase.from("projects").update(projectData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating project:", error)
    return { success: false, error: error.message }
  }
  revalidatePath("/projects")
  revalidatePath(`/projects/${id}`)
  revalidatePath("/admin/projects")
  return { success: true, project: data }
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminUser())) {
    return { success: false, error: "Nur Administratoren können Projekte löschen." }
  }
  // Wichtig: Hier ServiceRoleClient verwenden, wenn RLS das Löschen durch created_by nicht direkt erlaubt
  // oder wenn Kaskadierung komplex ist und sichergestellt werden muss.
  // Für dieses Beispiel nehmen wir an, RLS für Admins erlaubt das Löschen.
  const supabase = await createSupabaseServiceRoleClient() // Sicherstellen, dass Admins löschen dürfen, auch wenn sie nicht created_by sind
  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    console.error("Error deleting project:", error)
    return { success: false, error: error.message }
  }
  revalidatePath("/projects")
  revalidatePath("/admin/projects")
  return { success: true }
}
