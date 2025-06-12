"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"
import type { Database } from "@/lib/supabase/database.types"
import type { PostgrestError } from "@supabase/supabase-js"

export type CommentTask = Database["public"]["Tables"]["comments"]["Row"] & {
  profiles?: Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "full_name" | "email"> | null // Author
  projects?: Pick<Database["public"]["Tables"]["projects"]["Row"], "id" | "name"> | null
  entries?: Pick<Database["public"]["Tables"]["entries"]["Row"], "id" | "activity"> | null
  // recipient_profiles: Array<Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "full_name">> // Für die Zukunft
}
export type CommentTaskInsert = Database["public"]["Tables"]["comments"]["Insert"]

async function getUserProfile() {
  const supabase = await createSupabaseServerActionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  return profile
}

export async function getTasks(filters?: {
  projectId?: string
  entryId?: string
  status?: string
}): Promise<CommentTask[]> {
  const supabase = await createSupabaseServerActionClient()
  const profile = await getUserProfile()
  if (!profile) return []

  let query = supabase
    .from("comments")
    .select("*, profiles!author_id(id, full_name, email), projects(id, name), entries(id, activity)")
    .order("created_at", { ascending: false })

  // RLS sollte den Zugriff bereits einschränken (Autor, Empfänger, Admin)
  // Hier könnten zusätzliche Filter angewendet werden
  if (filters?.projectId) query = query.eq("project_id", filters.projectId)
  if (filters?.entryId) query = query.eq("entry_id", filters.entryId)
  if (filters?.status) query = query.eq("status", filters.status)

  const { data, error } = await query
  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }
  return data || []
}

export async function createTask(
  taskData: Pick<
    CommentTaskInsert,
    "content" | "project_id" | "entry_id" | "status" | "is_procurement" | "recipient_ids"
  >,
): Promise<{ success: boolean; error?: string | PostgrestError; task?: CommentTask }> {
  const supabase = await createSupabaseServerActionClient()
  const profile = await getUserProfile()
  if (!profile) return { success: false, error: "Benutzer nicht authentifiziert." }

  const { data: newTask, error } = await supabase
    .from("comments")
    .insert({ ...taskData, author_id: profile.id })
    .select("*, profiles!author_id(id, full_name, email), projects(id, name), entries(id, activity)")
    .single()

  if (error) {
    console.error("Error creating task:", error)
    return { success: false, error: error }
  }
  revalidatePath("/tasks")
  if (taskData.entryId) revalidatePath(`/entries/${taskData.entryId}`) // Falls Aufgaben bei Einträgen angezeigt werden
  if (taskData.projectId) revalidatePath(`/projects/${taskData.projectId}`)
  return { success: true, task: newTask }
}

export async function updateTaskStatus(
  id: string,
  status: "NEU" | "OFFEN" | "ERLEDIGT",
): Promise<{ success: boolean; error?: string | PostgrestError; task?: CommentTask }> {
  const supabase = await createSupabaseServerActionClient()
  const profile = await getUserProfile() // Für Berechtigungsprüfung
  if (!profile) return { success: false, error: "Benutzer nicht authentifiziert." }

  // Berechtigungsprüfung
  const { data: existingTask, error: fetchError } = await supabase
    .from("comments")
    .select("author_id, recipient_ids")
    .eq("id", id)
    .single()

  if (fetchError || !existingTask) {
    console.error("Error fetching task for status update:", fetchError)
    return { success: false, error: "Aufgabe nicht gefunden." }
  }

  const isAuthor = existingTask.author_id === profile.id
  const isRecipient = existingTask.recipient_ids?.includes(profile.id)
  const isAdmin = profile.role === "admin"

  if (!isAuthor && !isRecipient && !isAdmin) {
    return { success: false, error: "Keine Berechtigung, den Status zu ändern." }
  }

  const { data, error } = await supabase
    .from("comments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, profiles!author_id(id, full_name, email), projects(id, name), entries(id, activity)")
    .single()

  if (error) {
    console.error("Error updating task status:", error)
    return { success: false, error: error }
  }
  revalidatePath("/tasks")
  return { success: true, task: data }
}

export async function deleteTask(id: string): Promise<{ success: boolean; error?: string | PostgrestError }> {
  const supabase = await createSupabaseServerActionClient()
  const profile = await getUserProfile()
  if (!profile) return { success: false, error: "Benutzer nicht authentifiziert." }

  // Berechtigungsprüfung
  const { data: existingTask, error: fetchError } = await supabase
    .from("comments")
    .select("author_id")
    .eq("id", id)
    .single()

  if (fetchError || !existingTask) {
    console.error("Error fetching task for delete:", fetchError)
    return { success: false, error: "Aufgabe nicht gefunden." }
  }

  const isAuthor = existingTask.author_id === profile.id
  const isAdmin = profile.role === "admin"

  if (!isAuthor && !isAdmin) {
    return { success: false, error: "Keine Berechtigung, diese Aufgabe zu löschen." }
  }

  const { error } = await supabase.from("comments").delete().eq("id", id)
  if (error) {
    console.error("Error deleting task:", error)
    return { success: false, error: error }
  }
  revalidatePath("/tasks")
  return { success: true }
}
