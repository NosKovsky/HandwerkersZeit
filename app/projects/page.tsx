"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import Layout from "@/components/layout"
import AuthGuard from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FolderOpen, FileText, Receipt, Images, Calendar, Euro, Clock } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface ProjectData {
  name: string
  entriesCount: number
  receiptsCount: number
  receiptsTotal: number
  imagesCount: number
  lastActivity: string
  entries: any[]
  receipts: any[]
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("All Projects")
  const [projectDetails, setProjectDetails] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  useEffect(() => {
    if (selectedProject === "All Projects") {
      setProjectDetails(null)
    } else {
      const project = projects.find((p) => p.name === selectedProject)
      setProjectDetails(project || null)
    }
  }, [selectedProject, projects])

  const fetchProjects = async () => {
    try {
      // Get all entries with their projects
      const { data: entries } = await supabase
        .from("entries")
        .select("project, date, images, activity, time")
        .eq("user_id", user!.id)

      // Get all receipts
      const { data: receipts } = await supabase
        .from("receipts")
        .select("amount, date, image_url, description, company")
        .eq("user_id", user!.id)

      if (!entries) return

      // Group by project
      const projectMap = new Map<string, ProjectData>()

      entries.forEach((entry) => {
        const project = entry.project
        if (!projectMap.has(project)) {
          projectMap.set(project, {
            name: project,
            entriesCount: 0,
            receiptsCount: 0,
            receiptsTotal: 0,
            imagesCount: 0,
            lastActivity: entry.date,
            entries: [],
            receipts: [],
          })
        }

        const projectData = projectMap.get(project)!
        projectData.entriesCount++
        projectData.entries.push(entry)

        if (entry.images) {
          projectData.imagesCount += entry.images.length
        }

        if (entry.date > projectData.lastActivity) {
          projectData.lastActivity = entry.date
        }
      })

      // Add receipt data (receipts don't have projects, so we'll show them separately)
      const allReceiptsProject: ProjectData = {
        name: "Alle Quittungen",
        entriesCount: 0,
        receiptsCount: receipts?.length || 0,
        receiptsTotal: receipts?.reduce((sum, r) => sum + r.amount, 0) || 0,
        imagesCount: receipts?.filter((r) => r.image_url).length || 0,
        lastActivity: receipts?.[0]?.date || "",
        entries: [],
        receipts: receipts || [],
      }

      const projectsArray = Array.from(projectMap.values()).sort(
        (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
      )

      if (receipts && receipts.length > 0) {
        projectsArray.push(allReceiptsProject)
      }

      setProjects(projectsArray)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner size="lg" />
          </div>
        </Layout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projekte</h1>
            <p className="mt-2 text-gray-600">Übersicht aller Projekte und deren Aktivitäten</p>
          </div>

          {/* Project Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Projekt auswählen</CardTitle>
              <CardDescription>Wählen Sie ein Projekt für detaillierte Informationen</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Projekt auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Projects">Alle Projekte</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.name} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Project Details */}
          {projectDetails ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FolderOpen className="mr-2 h-5 w-5" />
                    {projectDetails.name}
                  </CardTitle>
                  <CardDescription>Letzte Aktivität: {formatDate(projectDetails.lastActivity)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-900">{projectDetails.entriesCount}</div>
                        <div className="text-sm text-blue-600">Einträge</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                      <Receipt className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold text-green-900">{projectDetails.receiptsCount}</div>
                        <div className="text-sm text-green-600">Quittungen</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                      <Images className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold text-purple-900">{projectDetails.imagesCount}</div>
                        <div className="text-sm text-purple-600">Bilder</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                      <Euro className="h-8 w-8 text-yellow-600" />
                      <div>
                        <div className="text-2xl font-bold text-yellow-900">
                          {formatCurrency(projectDetails.receiptsTotal)}
                        </div>
                        <div className="text-sm text-yellow-600">Ausgaben</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Entries */}
              {projectDetails.entries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Letzte Einträge</CardTitle>
                    <CardDescription>Die neuesten Arbeitseinträge für dieses Projekt</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projectDetails.entries.slice(0, 5).map((entry, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="mr-1 h-4 w-4" />
                              {formatDate(entry.date)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="mr-1 h-4 w-4" />
                              {entry.time}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{entry.activity}</p>
                            {entry.images && entry.images.length > 0 && (
                              <Badge variant="secondary" className="mt-1">
                                <Images className="mr-1 h-3 w-3" />
                                {entry.images.length} Bild{entry.images.length !== 1 ? "er" : ""}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Receipts */}
              {projectDetails.receipts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Letzte Quittungen</CardTitle>
                    <CardDescription>Die neuesten Quittungen</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projectDetails.receipts.slice(0, 5).map((receipt, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="mr-1 h-4 w-4" />
                                {formatDate(receipt.date)}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">{receipt.description}</div>
                              <div className="text-sm text-gray-500">{receipt.company}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">{formatCurrency(receipt.amount)}</div>
                            {receipt.image_url && (
                              <Badge variant="secondary" className="mt-1">
                                <Images className="mr-1 h-3 w-3" />
                                Bild
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Projects Overview */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.name}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedProject(project.name)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FolderOpen className="mr-2 h-5 w-5" />
                      {project.name}
                    </CardTitle>
                    <CardDescription>Letzte Aktivität: {formatDate(project.lastActivity)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Einträge:</span>
                        <Badge variant="outline">{project.entriesCount}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quittungen:</span>
                        <Badge variant="outline">{project.receiptsCount}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Bilder:</span>
                        <Badge variant="outline">{project.imagesCount}</Badge>
                      </div>
                      {project.receiptsTotal > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm font-medium">Ausgaben:</span>
                          <span className="font-bold text-green-600">{formatCurrency(project.receiptsTotal)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {projects.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Projekte</h3>
                <p className="mt-1 text-sm text-gray-500">Erstellen Sie Ihren ersten Arbeitseintrag.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </AuthGuard>
  )
}
