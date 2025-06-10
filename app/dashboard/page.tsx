"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ImportantTodosWidget } from "@/components/dashboard/important-todos-widget"
import { DashboardVoiceControl } from "@/components/dashboard/dashboard-voice-control"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Clock, Mic, Building, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

interface Project {
  id: string
  name: string
  address: string
  status: string
  created_at: string
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [currentProjects, setCurrentProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const fetchCurrentProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) {
          console.error("Error fetching projects:", error)
          setCurrentProjects([])
        } else {
          setCurrentProjects(data || [])
        }
      } catch (error) {
        console.error("Error:", error)
        setCurrentProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentProjects()
  }, [supabase])

  const handleEndWorkDay = () => {
    toast.success("Arbeitszeit beendet! 🏠")
    // Hier würde die Logik für das Beenden der Arbeitszeit implementiert
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🔨 HandwerkersZeit Dashboard
            </h1>
            <p className="text-muted-foreground">Willkommen zurück, {profile?.full_name || "Handwerker"}!</p>
          </div>
        </div>

        {/* Statistiken */}
        <StatsCards />

        {/* Wichtige Aufgaben - direkt unter den Zahlen */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <span>Wichtige Aufgaben</span>
              <Badge variant="destructive">Dringend</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImportantTodosWidget />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Arbeitszeit beenden - Prominenter Platz */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
                <Clock className="h-8 w-8 text-red-500" />
                <span>Arbeitszeit</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button
                onClick={handleEndWorkDay}
                size="lg"
                className="w-full h-16 text-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-xl"
              >
                <Clock className="h-6 w-6 mr-3" />
                Arbeitszeit beenden
              </Button>
              <p className="text-sm text-muted-foreground">Klicken Sie hier, um Ihren Arbeitstag zu beenden</p>
            </CardContent>
          </Card>

          {/* Sprachsteuerung */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
                <Mic className="h-8 w-8 text-blue-500" />
                <span>Sprachsteuerung</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Verwenden Sie Ihre Stimme für schnelle Aktionen</p>
                <DashboardVoiceControl />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aktuelle Baustellen */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-6 w-6 text-green-500" />
              <span>Aktuelle Baustellen</span>
              <Badge variant="secondary">{currentProjects.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Lade Baustellen...</p>
              </div>
            ) : currentProjects.length > 0 ? (
              <div className="space-y-4">
                {currentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.address}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    >
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Keine aktiven Baustellen</p>
                <p className="text-sm text-muted-foreground mt-1">Erstellen Sie eine neue Baustelle über das Menü</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
