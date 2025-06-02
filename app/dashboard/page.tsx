"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, CalendarDays, Loader2 } from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

type Entry = Database["public"]["Tables"]["entries"]["Row"]

export default function DashboardPage() {
  const { profile, loadingInitial: authLoading, user } = useAuth()
  const supabase = createSupabaseBrowserClient()
  const [totalHoursMonth, setTotalHoursMonth] = useState(0)
  const [totalHoursOverall, setTotalHoursOverall] = useState(0)
  const [recentEntries, setRecentEntries] = useState<Entry[]>([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        setLoadingStats(true)
        const currentDate = new Date()
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          .toISOString()
          .split("T")[0]
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0]

        // Gesamtstunden diesen Monat
        const { data: monthEntries, error: monthError } = await supabase
          .from("entries")
          .select("hours")
          .eq("user_id", user.id)
          .gte("entry_date", firstDayOfMonth)
          .lte("entry_date", lastDayOfMonth)

        if (monthError) console.error("Error fetching month entries:", monthError)
        const currentMonthHours = monthEntries?.reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0) || 0
        setTotalHoursMonth(currentMonthHours)

        // Gesamtstunden überhaupt
        const { data: allEntries, error: allError } = await supabase
          .from("entries")
          .select("hours")
          .eq("user_id", user.id)

        if (allError) console.error("Error fetching all entries:", allError)
        const overallHours = allEntries?.reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0) || 0
        setTotalHoursOverall(overallHours)

        // Letzte Einträge
        const { data: recent, error: recentError } = await supabase
          .from("entries")
          .select("*, projects(name)") // Annahme: projects Tabelle hat 'name'
          .eq("user_id", user.id)
          .order("entry_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentError) console.error("Error fetching recent entries:", recentError)
        setRecentEntries(recent || [])

        setLoadingStats(false)
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
        <h1 className="text-3xl font-semibold">
          Willkommen zurück, {profile?.full_name || profile?.email || "Benutzer"}!
        </h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arbeitsstunden (Dieser Monat)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{totalHoursMonth.toFixed(2)} h</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arbeitsstunden (Gesamt)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{totalHoursOverall.toFixed(2)} h</div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kalenderübersicht</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Kalenderansicht wird hier implementiert. Klicken auf Tag zeigt Einträge.
              </p>
              {/* Hier kommt die Kalenderkomponente rein */}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Letzte Einträge</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : recentEntries.length > 0 ? (
              <ul className="space-y-2">
                {recentEntries.map((entry) => (
                  <li key={entry.id} className="text-sm p-2 border rounded-md">
                    <span className="font-semibold">{new Date(entry.entry_date).toLocaleDateString("de-DE")}:</span>{" "}
                    {entry.activity}
                    {/* @ts-ignore */}
                    {entry.projects?.name && ` (${entry.projects.name})`} - {Number(entry.hours).toFixed(2)}h
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Keine aktuellen Einträge vorhanden.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
