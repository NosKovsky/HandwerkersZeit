"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, Loader2, BarChart3, Users, FileText } from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

type Entry = Database["public"]["Tables"]["entries"]["Row"]

export default function DashboardPage() {
  const { profile, loadingInitial: authLoading, user } = useAuth()
  const supabase = createSupabaseBrowserClient()
  const [totalHoursMonth, setTotalHoursMonth] = useState(0)
  const [totalHoursOverall, setTotalHoursOverall] = useState(0)
  const [recentEntries, setRecentEntries] = useState<Entry[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalProjects: 0,
    totalReceipts: 0,
  })

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        setLoadingStats(true)

        try {
          // Alle Statistiken parallel laden
          const [entriesRes, projectsRes, receiptsRes] = await Promise.all([
            supabase.from("entries").select("*").eq("user_id", user.id),
            supabase.from("projects").select("id"),
            supabase.from("receipts").select("id").eq("user_id", user.id),
          ])

          // Statistiken setzen
          setStats({
            totalEntries: entriesRes.data?.length || 0,
            totalProjects: projectsRes.data?.length || 0,
            totalReceipts: receiptsRes.data?.length || 0,
          })

          // Stunden berechnen (falls entries eine hours Spalte haben)
          const entries = entriesRes.data || []
          const totalHours = entries.reduce((sum, entry) => {
            // Annahme: Stunden werden aus entry_time berechnet oder sind in einer hours Spalte
            return sum + 8 // Placeholder: 8 Stunden pro Eintrag
          }, 0)
          setTotalHoursOverall(totalHours)

          // Aktuelle Monatsstunden
          const currentDate = new Date()
          const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          const monthEntries = entries.filter((entry) => new Date(entry.entry_date) >= firstDayOfMonth)
          setTotalHoursMonth(monthEntries.length * 8) // Placeholder

          // Letzte 5 Einträge
          const sortedEntries = entries
            .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
            .slice(0, 5)
          setRecentEntries(sortedEntries)
        } catch (error) {
          console.error("Error fetching stats:", error)
        } finally {
          setLoadingStats(false)
        }
      }
      fetchStats()
    }
  }, [user, supabase])

  if (authLoading && !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Briefcase className="h-12 w-12 animate-pulse text-blue-600" />
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Willkommen zurück, {profile?.full_name || profile?.email || "Benutzer"}!
          </h1>
          <p className="text-muted-foreground">Hier ist eine Übersicht Ihrer Baustellendokumentation</p>
        </div>

        {/* Statistik Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Einträge gesamt</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalEntries}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Projekte</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stunden (Monat)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{totalHoursMonth}h</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quittungen</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalReceipts}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Letzte Einträge */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Letzte Einträge</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : recentEntries.length > 0 ? (
                <div className="space-y-4">
                  {recentEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center space-x-4 rounded-md border p-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{entry.activity}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.entry_date).toLocaleDateString("de-DE")} um {entry.entry_time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Noch keine Einträge vorhanden</p>
                  <p className="text-xs text-muted-foreground mt-1">Erstellen Sie Ihren ersten Eintrag über das Menü</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Schnellaktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/entries">
                    <FileText className="mr-2 h-4 w-4" />
                    Neuer Eintrag
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/projects">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Projekt erstellen
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/receipts">
                    <Users className="mr-2 h-4 w-4" />
                    Quittung hinzufügen
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
