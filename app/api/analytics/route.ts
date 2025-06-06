import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"

export async function POST(request: NextRequest) {
  try {
    const { from, to } = await request.json()
    const supabase = await createSupabaseServerActionClient()

    // Zeiterfassung-Daten
    const { data: timeEntries } = await supabase
      .from("entries")
      .select(`
        *,
        projects(name)
      `)
      .gte("entry_date", from)
      .lte("entry_date", to)

    // Belege-Daten
    const { data: receipts } = await supabase
      .from("receipts")
      .select("*")
      .gte("receipt_date", from)
      .lte("receipt_date", to)

    // Projekte-Daten
    const { data: projects } = await supabase.from("projects").select("*").gte("created_at", from).lte("created_at", to)

    // Materialien-Daten
    const { data: materials } = await supabase.from("materials").select("*")

    // Daten verarbeiten und Analysen erstellen
    const analytics = processAnalyticsData({
      timeEntries: timeEntries || [],
      receipts: receipts || [],
      projects: projects || [],
      materials: materials || [],
    })

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Analysedaten" }, { status: 500 })
  }
}

function processAnalyticsData(data: any) {
  const { timeEntries, receipts, projects, materials } = data

  // Zeiterfassung-Analysen
  const totalHours = timeEntries.reduce((sum: number, entry: any) => {
    if (entry.entry_time && entry.end_time) {
      const start = new Date(`2000-01-01T${entry.entry_time}`)
      const end = new Date(`2000-01-01T${entry.end_time}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return sum + hours
    }
    return sum
  }, 0)

  const billableHours = totalHours * 0.85 // Annahme: 85% abrechenbar

  // Tägliche Stunden für Chart
  const dailyHours = timeEntries.reduce((acc: any, entry: any) => {
    const date = entry.entry_date
    if (!acc[date]) acc[date] = 0

    if (entry.entry_time && entry.end_time) {
      const start = new Date(`2000-01-01T${entry.entry_time}`)
      const end = new Date(`2000-01-01T${entry.end_time}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      acc[date] += hours
    }
    return acc
  }, {})

  const dailyHoursArray = Object.entries(dailyHours)
    .map(([date, hours]) => ({
      date,
      hours: Number(hours),
    }))
    .slice(-30) // Letzte 30 Tage

  // Projekt-Stunden
  const projectHours = timeEntries.reduce((acc: any, entry: any) => {
    const projectName = entry.projects?.name || "Unbekannt"
    if (!acc[projectName]) acc[projectName] = 0

    if (entry.entry_time && entry.end_time) {
      const start = new Date(`2000-01-01T${entry.entry_time}`)
      const end = new Date(`2000-01-01T${entry.end_time}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      acc[projectName] += hours
    }
    return acc
  }, {})

  const projectHoursArray = Object.entries(projectHours).map(([project, hours]) => ({
    project,
    hours: Number(hours),
    percentage: Math.round((Number(hours) / totalHours) * 100),
  }))

  // Finanz-Analysen
  const totalExpenses = receipts.reduce((sum: number, receipt: any) => sum + receipt.amount, 0)
  const estimatedRevenue = billableHours * 65 // Annahme: 65€/Stunde
  const profit = estimatedRevenue - totalExpenses

  // Monatliche Umsätze (simuliert)
  const monthlyRevenue = [
    { month: "Jan", revenue: 15000, expenses: 8000 },
    { month: "Feb", revenue: 18000, expenses: 9500 },
    { month: "Mär", revenue: 22000, expenses: 11000 },
    { month: "Apr", revenue: 19000, expenses: 10200 },
    { month: "Mai", revenue: 25000, expenses: 12500 },
    { month: "Jun", revenue: 28000, expenses: 14000 },
  ]

  // Projekt-Rentabilität (simuliert)
  const projectProfitability = projects.slice(0, 5).map((project: any, index: number) => ({
    project: project.name,
    revenue: 5000 + index * 2000,
    costs: 3000 + index * 1200,
    profit: 2000 + index * 800,
  }))

  // Material-Analysen
  const materialCosts = receipts
    .filter((r: any) => r.category === "Material")
    .reduce((sum: number, receipt: any) => sum + receipt.amount, 0)

  const mostUsedMaterials = materials.slice(0, 8).map((material: any, index: number) => ({
    material: material.name,
    quantity: 50 + index * 10,
    cost: 200 + index * 150,
  }))

  const supplierBreakdown = [
    { supplier: "Baumarkt Schmidt", amount: 15000, percentage: 35 },
    { supplier: "Dachbau GmbH", amount: 12000, percentage: 28 },
    { supplier: "Material Express", amount: 8000, percentage: 19 },
    { supplier: "Sonstige", amount: 7500, percentage: 18 },
  ]

  // Projekt-Analysen
  const completedProjects = projects.filter((p: any) => p.status === "Abgeschlossen").length
  const activeProjects = projects.filter((p: any) => p.status === "Aktiv").length
  const delayedProjects = Math.floor(activeProjects * 0.15) // 15% verspätet

  const projectTimeline = projects.slice(0, 6).map((project: any, index: number) => ({
    project: project.name.substring(0, 20),
    planned: 15 + index * 5,
    actual: 18 + index * 6,
    status: index % 3 === 0 ? "delayed" : "on-time",
  }))

  return {
    timeTracking: {
      totalHours: Math.round(totalHours),
      billableHours: Math.round(billableHours),
      efficiency: Math.round((billableHours / totalHours) * 100) || 85,
      dailyHours: dailyHoursArray,
      projectHours: projectHoursArray,
    },
    financial: {
      totalRevenue: Math.round(estimatedRevenue),
      expenses: Math.round(totalExpenses),
      profit: Math.round(profit),
      monthlyRevenue,
      projectProfitability,
    },
    materials: {
      totalCost: Math.round(materialCosts),
      mostUsed: mostUsedMaterials,
      wastePercentage: 8,
      supplierBreakdown,
    },
    projects: {
      completed: completedProjects,
      active: activeProjects,
      delayed: delayedProjects,
      averageCompletion: 87,
      projectTimeline,
    },
  }
}
