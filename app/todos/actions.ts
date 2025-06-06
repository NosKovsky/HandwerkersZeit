import { revalidatePath } from "next/cache"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"
import type { Database } from "@/lib/supabase/database.types"

export type ProjectTodo = Database["public"]["Tables"]["project_todos"]["Row"]
export type ProjectTodoInsert = Database["public"]["Tables"]["project_todos"]["Insert"]

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

export async function getTodosByProject(projectId: string): Promise<ProjectTodo[]> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return []

    const { data, error } = await supabase
      .from("project_todos")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching todos:", error)
      throw new Error(`Fehler beim Laden der Aufgaben: ${error.message}`)
    }
    return data || []
  } catch (error) {
    console.error("Unexpected error in getTodosByProject:", error)
    return []
  }
}

export async function createTodo(
  todoData: Omit<ProjectTodoInsert, "id" | "created_by" | "created_at" | "updated_at">,
): Promise<{ success: boolean; error?: string; todo?: ProjectTodo }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Benutzer nicht authentifiziert." }

    if (!todoData.content || todoData.content.trim().length < 3) {
      return { success: false, error: "Aufgabe muss mindestens 3 Zeichen haben." }
    }

    const { data: newTodo, error: todoError } = await supabase
      .from("project_todos")
      .insert({ ...todoData, created_by: user.id })
      .select()
      .single()

    if (todoError) {
      console.error("Error creating todo:", todoError)
      return { success: false, error: `Fehler beim Erstellen der Aufgabe: ${todoError.message}` }
    }

    revalidatePath(`/baustellen/${todoData.project_id}`)
    return { success: true, todo: newTodo }
  } catch (error) {
    console.error("Unexpected error in createTodo:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function toggleTodoCompletion(
  id: string,
  isCompleted: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return { success: false, error: "Benutzer nicht authentifiziert." }

    const updateData: any = {
      is_completed: isCompleted,
    }

    if (isCompleted) {
      updateData.completed_at = new Date().toISOString()
    } else {
      updateData.completed_at = null
    }

    const { error: updateError } = await supabase.from("project_todos").update(updateData).eq("id", id)

    if (updateError) {
      console.error("Error updating todo:", updateError)
      return { success: false, error: `Fehler beim Aktualisieren: ${updateError.message}` }
    }

    // Revalidate the project page
    const { data: todo } = await supabase.from("project_todos").select("project_id").eq("id", id).single()

    if (todo) {
      revalidatePath(`/baustellen/${todo.project_id}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected error in toggleTodoCompletion:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function deleteTodo(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return { success: false, error: "Benutzer nicht authentifiziert." }

    // Get project_id for revalidation
    const { data: todo } = await supabase.from("project_todos").select("project_id").eq("id", id).single()

    const { error: deleteError } = await supabase.from("project_todos").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting todo:", deleteError)
      return { success: false, error: `Fehler beim Löschen: ${deleteError.message}` }
    }

    if (todo) {
      revalidatePath(`/baustellen/${todo.project_id}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected error in deleteTodo:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}
