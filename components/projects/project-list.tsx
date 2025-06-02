"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, DollarSign } from "lucide-react"

type Project = {
  id: string
  name: string
  description: string | null
  status: "active" | "paused" | "completed"
  budget: number | null
  start_date: string | null
  end_date: string | null
  created_by: string
  created_at: string
}

export function ProjectList() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Aktiv"
      case "paused":
        return "Pausiert"
      case "completed":
        return "Abgeschlossen"
      default:
        return status
    }
  }

  if (loading) {
    return <div>Projekte werden geladen...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projekte</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neues Projekt
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge className={getStatusColor(project.status)}>{getStatusText(project.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.description && <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {project.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(project.start_date).toLocaleDateString("de-DE")}
                  </div>
                )}

                {project.budget && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {project.budget.toLocaleString("de-DE")}€
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Noch keine Projekte vorhanden. Erstellen Sie Ihr erstes Projekt!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
