import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"

export async function POST(request: NextRequest) {
  try {
    const { projectId, content, priority } = await request.json()

    if (!projectId || !content) {
      return NextResponse.json({ error: "ProjectId und Content sind erforderlich" }, { status: 400 })
    }

    const supabase = await createSupabaseServerActionClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { data: newTodo, error: todoError } = await supabase
      .from("project_todos")
      .insert({
        project_id: projectId,
        content: content,
        created_by: user.id,
        is_completed: false,
      })
      .select()
      .single()

    if (todoError) {
      console.error("Error creating todo:", todoError)
      return NextResponse.json({ error: "Fehler beim Erstellen der Aufgabe" }, { status: 500 })
    }

    return NextResponse.json(newTodo)
  } catch (error) {
    console.error("Create todo error:", error)
    return NextResponse.json({ error: "Unerwarteter Fehler" }, { status: 500 })
  }
}
