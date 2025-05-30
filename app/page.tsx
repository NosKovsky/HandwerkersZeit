"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import Layout from "@/components/layout"
import AuthGuard from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Receipt, CheckSquare, Clock } from "lucide-react"

interface DashboardStats {
  entriesThisMonth: number
  receiptsThisMonth: number
  openTasks: number
  hoursThisMonth: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    entriesThisMonth: 0,
    receiptsThisMonth: 0,
    openTasks: 0,
    hoursThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const firstDayOfMonthStr = firstDayOfMonth.toISOString().split("T")[0]

      // Einträge diesen Monat
      const { count: entriesCount } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("date", firstDayOfMonthStr)

      // Quittungen diesen Monat
      const { count: receiptsCount } = await supabase
        .from("receipts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("date", firstDayOfMonthStr)

      // Offene Aufgaben
      const { count: tasksCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .in("status", ["new", "open"])

      // Arbeitsstunden diesen Monat (vereinfacht: 8h pro Eintrag)
      const hoursThisMonth = (entriesCount || 0) * 8

      setStats({
        entriesThisMonth: entriesCount || 0,
        receiptsThisMonth: receiptsCount || 0,
        openTasks: tasksCount || 0,
        hoursThisMonth,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Willkommen zurück! Hier ist eine Übersicht Ihrer aktuellen Aktivitäten.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Einträge (Monat)</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.entriesThisMonth}</div>
                <p className="text-xs text-muted-foreground">Arbeitseinträge diesen Monat</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quittungen (Monat)</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.receiptsThisMonth}</div>
                <p className="text-xs text-muted-foreground">Quittungen diesen Monat</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offene Aufgaben</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.openTasks}</div>
                <p className="text-xs text-muted-foreground">Noch zu erledigen</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stunden (Monat)</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.hoursThisMonth}h</div>
                <p className="text-xs text-muted-foreground">Geschätzte Arbeitszeit</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Schnellaktionen</CardTitle>
              <CardDescription>Häufig verwendete Funktionen für den schnellen Zugriff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <a
                  href="/entries"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Neuer Eintrag</h3>
                    <p className="text-sm text-gray-500">Arbeitseintrag hinzufügen</p>
                  </div>
                </a>

                <a
                  href="/receipts"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Receipt className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Quittung erfassen</h3>
                    <p className="text-sm text-gray-500">Neue Quittung hinzufügen</p>
                  </div>
                </a>

                <a href="/tasks" className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <CheckSquare className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Aufgaben</h3>
                    <p className="text-sm text-gray-500">Aufgaben verwalten</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  )
}
