"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, Clock, Users, Activity } from "lucide-react"

type Stats = {
  totalProjects: number
  activeProjects: number
  totalHours: number
  totalUsers: number
}

export function StatsCards() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    totalHours: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [profile])

  const fetchStats = async () => {
    try {
      // Projekte zählen
      const { count: totalProjects } = await supabase.from("projects").select("*", { count: "exact", head: true })

      const { count: activeProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")

      // Gesamtstunden berechnen
      const { data: timeEntries } = await supabase.from("time_entries").select("hours")

      const totalHours = timeEntries?.reduce((sum, entry) => sum + entry.hours, 0) || 0

      // Benutzer zählen (nur für Admins)
      let totalUsers = 0
      if (profile?.role === "admin") {
        const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true })
        totalUsers = count || 0
      }

      setStats({
        totalProjects: totalProjects || 0,
        activeProjects: activeProjects || 0,
        totalHours,
        totalUsers,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: "Gesamte Projekte",
      value: stats.totalProjects,
      icon: FolderOpen,
      show: true,
    },
    {
      title: "Aktive Projekte",
      value: stats.activeProjects,
      icon: Activity,
      show: true,
    },
    {
      title: "Erfasste Stunden",
      value: `${stats.totalHours.toFixed(1)}h`,
      icon: Clock,
      show: true,
    },
    {
      title: "Benutzer",
      value: stats.totalUsers,
      icon: Users,
      show: profile?.role === "admin",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards
        .filter((card) => card.show)
        .map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : card.value}</div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
