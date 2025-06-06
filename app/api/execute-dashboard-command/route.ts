import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"
import type { DashboardCommand } from "@/lib/openai-modes"

export async function POST(request: NextRequest) {
  try {
    const command: DashboardCommand = await request.json()
    const supabase = await createSupabaseServerActionClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    switch (command.type) {
      case "create_project":
        return await handleCreateProject(command, supabase, user.id)
      case "create_task":
        return await handleCreateTask(command, supabase, user.id)
      case "add_worktime":
        return await handleAddWorktime(command, supabase, user.id)
      case "create_material_order":
        return await handleCreateMaterialOrder(command, supabase, user.id)
      default:
        return NextResponse.json({ error: "Unbekannter Befehlstyp" }, { status: 400 })
    }
  } catch (error) {
    console.error("Execute command error:", error)
    return NextResponse.json({ error: "Unerwarteter Fehler" }, { status: 500 })
  }
}

async function handleCreateProject(command: DashboardCommand, supabase: any, userId: string) {
  if (!command.projectInfo) {
    return NextResponse.json({ error: "Projekt-Informationen fehlen" }, { status: 400 })
  }

  const { projectInfo } = command

  // Erst prüfen ob Baustelle bereits existiert
  const { data: existingProject } = await supabase
    .from("projects")
    .select("id, name, address")
    .ilike("address", `%${projectInfo.address}%`)
    .ilike("address", `%${projectInfo.city}%`)
    .limit(1)
    .single()

  if (existingProject && !projectInfo.isExisting) {
    return NextResponse.json({
      error: `Baustelle bereits vorhanden: ${existingProject.name} - ${existingProject.address}`,
      existingProject,
    })
  }

  if (!existingProject) {
    // Kunde suchen oder erstellen
    let customerId = null
    if (projectInfo.name.includes("Herr") || projectInfo.name.includes("Frau")) {
      const customerName = projectInfo.name.replace("Baustelle ", "")

      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .ilike("name", `%${customerName}%`)
        .limit(1)
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        const { data: newCustomer } = await supabase
          .from("customers")
          .insert({
            name: customerName,
            city: projectInfo.city,
          })
          .select("id")
          .single()

        if (newCustomer) {
          customerId = newCustomer.id
        }
      }
    }

    // Neue Baustelle erstellen
    const { data: newProject, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: projectInfo.name,
        address: `${projectInfo.address}, ${projectInfo.city}`,
        description: projectInfo.description,
        customer_id: customerId,
        created_by: userId,
        status: "Aktiv",
      })
      .select()
      .single()

    if (projectError) {
      return NextResponse.json({ error: "Fehler beim Erstellen der Baustelle" }, { status: 500 })
    }

    return NextResponse.json({ success: true, project: newProject })
  }

  return NextResponse.json({ success: true, project: existingProject })
}

async function handleCreateTask(command: DashboardCommand, supabase: any, userId: string) {
  if (!command.taskInfo) {
    return NextResponse.json({ error: "Aufgaben-Informationen fehlen" }, { status: 400 })
  }

  const { taskInfo } = command

  // Baustelle finden
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .ilike("address", `%${taskInfo.projectAddress}%`)
    .limit(1)
    .single()

  if (!project) {
    return NextResponse.json({ error: "Baustelle nicht gefunden" }, { status: 404 })
  }

  // Aufgabe erstellen
  const { data: newTask, error: taskError } = await supabase
    .from("project_todos")
    .insert({
      project_id: project.id,
      content: taskInfo.description,
      created_by: userId,
      is_completed: false,
      priority: taskInfo.priority,
      category: taskInfo.category,
    })
    .select()
    .single()

  if (taskError) {
    return NextResponse.json({ error: "Fehler beim Erstellen der Aufgabe" }, { status: 500 })
  }

  return NextResponse.json({ success: true, task: newTask })
}

async function handleAddWorktime(command: DashboardCommand, supabase: any, userId: string) {
  if (!command.worktimeInfo) {
    return NextResponse.json({ error: "Arbeitszeit-Informationen fehlen" }, { status: 400 })
  }

  const { worktimeInfo } = command

  // Baustelle finden
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .ilike("address", `%${worktimeInfo.projectAddress}%`)
    .limit(1)
    .single()

  if (!project) {
    return NextResponse.json({ error: "Baustelle nicht gefunden" }, { status: 404 })
  }

  // Arbeitszeit berechnen
  const startTime = new Date(`${worktimeInfo.date}T${worktimeInfo.startTime}:00`)
  const endTime = new Date(`${worktimeInfo.date}T${worktimeInfo.endTime}:00`)
  const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  const breakMinutes = worktimeInfo.breakMinutes || 0
  const workMinutes = totalMinutes - breakMinutes
  const hours = workMinutes / 60

  // Zeiteintrag erstellen
  const { data: newEntry, error: entryError } = await supabase
    .from("time_entries")
    .insert({
      user_id: userId,
      project_id: project.id,
      entry_date: worktimeInfo.date,
      entry_time: worktimeInfo.startTime,
      end_time: worktimeInfo.endTime,
      hours: hours,
      activity: "Arbeitszeit per Sprache erfasst",
      notes: worktimeInfo.description,
      break_minutes: breakMinutes,
    })
    .select()
    .single()

  if (entryError) {
    return NextResponse.json({ error: "Fehler beim Erstellen der Arbeitszeit" }, { status: 500 })
  }

  return NextResponse.json({ success: true, entry: newEntry })
}

async function handleCreateMaterialOrder(command: DashboardCommand, supabase: any, userId: string) {
  if (!command.taskInfo) {
    return NextResponse.json({ error: "Material-Informationen fehlen" }, { status: 400 })
  }

  const { taskInfo } = command

  // Baustelle finden
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .ilike("address", `%${taskInfo.projectAddress}%`)
    .limit(1)
    .single()

  if (!project) {
    return NextResponse.json({ error: "Baustelle nicht gefunden" }, { status: 404 })
  }

  // Material-Bestellung als Aufgabe erstellen
  const { data: newTask, error: taskError } = await supabase
    .from("project_todos")
    .insert({
      project_id: project.id,
      content: `🛒 HÄNDLER: ${taskInfo.description}`,
      created_by: userId,
      is_completed: false,
      priority: "urgent",
      category: "urgent_material",
    })
    .select()
    .single()

  if (taskError) {
    return NextResponse.json({ error: "Fehler beim Erstellen der Material-Bestellung" }, { status: 500 })
  }

  return NextResponse.json({ success: true, task: newTask })
}
