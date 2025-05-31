"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import Layout from "@/components/layout"
import AuthGuard from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Receipt, CheckSquare, Clock, TrendingUp, Calendar, Images, FolderOpen } from "lucide-react"

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
        <div className="space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Willkommen zurück! Hier ist eine Übersicht Ihrer aktuellen Aktivitäten.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="dashboard-card stat-card border-border dark:glass-card animate-fade-in animate-delay-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Einträge (Monat)</CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/20 p-1.5 text-primary">
                  <FileText className="h-full w-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.entriesThisMonth}</div>
                <p className="text-xs text-muted-foreground">Arbeitseinträge diesen Monat</p>
              </CardContent>
            </Card>

            <Card className="dashboard-card stat-card border-border dark:glass-card animate-fade-in animate-delay-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quittungen (Monat)</CardTitle>
                <div className="h-8 w-8 rounded-full bg-green-500/20 p-1.5 text-green-500">
                  <Receipt className="h-full w-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.receiptsThisMonth}</div>
                <p className="text-xs text-muted-foreground">Quittungen diesen Monat</p>
              </CardContent>
            </Card>

            <Card className="dashboard-card stat-card border-border dark:glass-card animate-fade-in animate-delay-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offene Aufgaben</CardTitle>
                <div className="h-8 w-8 rounded-full bg-purple-500/20 p-1.5 text-purple-500">
                  <CheckSquare className="h-full w-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.openTasks}</div>
                <p className="text-xs text-muted-foreground">Noch zu erledigen</p>
              </CardContent>
            </Card>

            <Card className="dashboard-card stat-card border-border dark:glass-card animate-fade-in animate-delay-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stunden (Monat)</CardTitle>
                <div className="h-8 w-8 rounded-full bg-amber-500/20 p-1.5 text-amber-500">
                  <Clock className="h-full w-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.hoursThisMonth}h</div>
                <p className="text-xs text-muted-foreground">Geschätzte Arbeitszeit</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-border dark:glass-card animate-fade-in animate-delay-400">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Schnellaktionen
              </CardTitle>
              <CardDescription>Häufig verwendete Funktionen für den schnellen Zugriff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto flex-col items-center justify-center p-6 space-y-3" asChild>
                  <a href="/entries">
                    <div className="h-12 w-12 rounded-full bg-primary/20 p-3 text-primary">
                      <FileText className="h-full w-full" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium">Neuer Eintrag</h3>
                      <p className="text-sm text-muted-foreground">Arbeitseintrag hinzufügen</p>
                    </div>
                  </a>
                </Button>

                <Button variant="outline" className="h-auto flex-col items-center justify-center p-6 space-y-3" asChild>
                  <a href="/receipts">
                    <div className="h-12 w-12 rounded-full bg-green-500/20 p-3 text-green-500">
                      <Receipt className="h-full w-full" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium">Quittung erfassen</h3>
                      <p className="text-sm text-muted-foreground">Neue Quittung hinzufügen</p>
                    </div>
                  </a>
                </Button>

                <Button variant="outline" className="h-auto flex-col items-center justify-center p-6 space-y-3" asChild>
                  <a href="/tasks">
                    <div className="h-12 w-12 rounded-full bg-purple-500/20 p-3 text-purple-500">
                      <CheckSquare className="h-full w-full" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium">Aufgaben</h3>
                      <p className="text-sm text-muted-foreground">Aufgaben verwalten</p>
                    </div>
                  </a>
                </Button>

                <Button variant="outline" className="h-auto flex-col items-center justify-center p-6 space-y-3" asChild>
                  <a href="/calendar">
                    <div className="h-12 w-12 rounded-full bg-amber-500/20 p-3 text-amber-500">
                      <Calendar className="h-full w-full" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium">Kalender</h3>
                      <p className="text-sm text-muted-foreground">Termine & Übersicht</p>
                    </div>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Features */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 animate-fade-in animate-delay-400">
            <Card className="border-border dark:glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Images className="mr-2 h-5 w-5 text-blue-400" />
                  Galerie
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Alle Bilder aus Einträgen und Quittungen an einem Ort verwalten.
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/gallery">Zur Galerie</a>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-border dark:glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="mr-2 h-5 w-5 text-amber-400" />
                  Projekte
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Übersicht aller Projekte und deren Aktivitäten.
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/projects">Zu den Projekten</a>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-border dark:glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="mr-2 h-5 w-5 text-green-400" />
                  Quittungen
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Verwalten Sie Ihre Ausgaben und Quittungen.
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/receipts">Zu den Quittungen</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  )
}
