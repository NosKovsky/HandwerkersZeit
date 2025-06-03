"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, Loader2, BarChart3, Users, FileText, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/supabase/database.types"

type Entry = Database["public"]["Tables"]["entries"]["Row"]

export default function DashboardPage() {
  const { profile, loading: authLoading, user } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [recentEntries, setRecentEntries] = useState<Entry[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalProjects: 0,
    totalReceipts: 0,
    totalHours: 0,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        setLoadingStats(true)

        try {
          // Alle Statistiken parallel laden mit besserer Fehlerbehandlung
          const [entriesRes, projectsRes, receiptsRes] = await Promise.all([
            supabase.from("entries").select("*", { count: "exact" }).eq("user_id", user.id),
            supabase.from("projects").select("*", { count: "exact" }),
            supabase.from("receipts").select("*", { count: "exact" }).eq("user_id", user.id),
          ])

          // Statistiken setzen mit Fallback-Werten
          setStats({
            totalEntries: entriesRes.count || 0,
            totalProjects: projectsRes.count || 0,
            totalReceipts: receiptsRes.count || 0,
            totalHours: (entriesRes.count || 0) * 8, // Placeholder: 8 Stunden pro Eintrag
          })

          // Letzte 5 Einträge laden
          if (entriesRes.data && entriesRes.data.length > 0) {
            const sortedEntries = entriesRes.data
              .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
              .slice(0, 5)
            setRecentEntries(sortedEntries)
          }
        } catch (error) {
          console.error("Error fetching stats:", error)
          // Setze Fallback-Werte bei Fehlern
          setStats({
            totalEntries: 0,
            totalProjects: 0,
            totalReceipts: 0,
            totalHours: 0,
          })
        } finally {
          setLoadingStats(false)
        }
      }
      fetchStats()
    }
  }, [user, supabase])

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Briefcase className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Lade HandwerkersZeit...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Willkommen zurück, {profile?.full_name || profile?.email || "Benutzer"}!
          </h1>
          <p className="text-muted-foreground">
            Hier ist eine Übersicht Ihrer Baustellendokumentation
            {profile?.role === "admin" && " (Administrator)"}
          </p>
        </div>

        {/* Verbesserte Statistik Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Einträge gesamt</CardTitle>
              <FileText className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Lädt...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-card-foreground">{stats.totalEntries}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Dokumentierte Aktivitäten
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Aktive Projekte</CardTitle>
              <BarChart3 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Lädt...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-card-foreground">{stats.totalProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Laufende Baustellen
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Erfasste Stunden</CardTitle>
              <Clock className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Lädt...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-card-foreground">{stats.totalHours}h</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Arbeitszeit dokumentiert
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Quittungen</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Lädt...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-card-foreground">{stats.totalReceipts}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Belege erfasst
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Verbesserte Content-Bereiche */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Letzte Einträge</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Lade Einträge...</span>
                  </div>
                </div>
              ) : recentEntries.length > 0 ? (
                <div className="space-y-4">
                  {recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center space-x-4 rounded-lg border border-border p-4 bg-background/50"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">{entry.activity}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.entry_date).toLocaleDateString("de-DE")} um {entry.entry_time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Noch keine Einträge vorhanden</p>
                  <p className="text-xs text-muted-foreground mt-1">Erstellen Sie Ihren ersten Eintrag über das Menü</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Schnellaktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
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
                {profile?.role === "admin" && (
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/users">
                      <Users className="mr-2 h-4 w-4" />
                      Benutzer verwalten
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
