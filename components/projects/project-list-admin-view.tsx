"use client"

import { Card } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { getProjects, deleteProject } from "@/app/projects/actions"
import type { Database } from "@/lib/supabase/database.types"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Search, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { ProjectForm } from "./project-form"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context" // Um Admin-Status zu prüfen

type Project = Database["public"]["Tables"]["projects"]["Row"]

export function ProjectListAdminView() {
  const { isAdmin } = useAuth() // Client-seitige Prüfung für UI-Elemente
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const { toast } = useToast()

  const fetchProjects = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (e) {
      setError("Fehler beim Laden der Projekte.")
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedProject(null)
    fetchProjects() // Daten neu laden
  }

  const openEditForm = (project: Project) => {
    setSelectedProject(project)
    setIsFormOpen(true)
  }

  const openNewForm = () => {
    setSelectedProject(null)
    setIsFormOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return
    setIsLoading(true) // Kann einen spezifischeren Ladezustand verwenden
    const result = await deleteProject(projectToDelete.id)
    if (result.success) {
      toast({ title: "Erfolg", description: "Projekt gelöscht." })
      fetchProjects()
    } else {
      toast({ title: "Fehler", description: result.error, variant: "destructive" })
    }
    setProjectToDelete(null)
    setIsLoading(false)
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isAdmin && !isLoading) {
    // Zeige nichts oder eine Meldung, wenn kein Admin (client-seitig)
    return (
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p className="font-bold">Zugriff Verweigert</p>
        <p>Sie haben keine Berechtigung, diesen Bereich zu verwalten.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Baustellen Verwalten</h1>
        {isAdmin && (
          <Button onClick={openNewForm}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Neue Baustelle
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Baustellen durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Lade Baustellen...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Fehler</p>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Adresse</TableHead>
                <TableHead className="hidden md:table-cell">Beschreibung</TableHead>
                {isAdmin && <TableHead className="text-right">Aktionen</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{project.address || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell truncate max-w-xs">
                      {project.description || "-"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => openEditForm(project)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Bearbeiten</span>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => setProjectToDelete(project)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Löschen</span>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-10">
                    Keine Baustellen gefunden.
                    {searchTerm && " Versuchen Sie einen anderen Suchbegriff."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog für Projektformular (Erstellen/Bearbeiten) */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>{/* Titel wird in ProjectForm gesetzt */}</DialogHeader>
          <ProjectForm project={selectedProject} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      {/* Dialog für Löschbestätigung */}
      <Dialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Baustelle Löschen Bestätigen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie die Baustelle &quot;{projectToDelete?.name}&quot; endgültig löschen möchten? Diese Aktion
              kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
