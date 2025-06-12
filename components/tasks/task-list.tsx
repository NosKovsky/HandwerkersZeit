"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { getTasks, updateTaskStatus, deleteTask, updateTask, type CommentTask } from "@/app/tasks/actions"
import { getProjects } from "@/app/projects/actions"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, ShoppingCart, Briefcase, ListChecks, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
// TODO: Dialog für Bearbeiten

export function TaskList() {
  const { isAdmin, user } = useAuth()
  const [tasks, setTasks] = useState<CommentTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [projectFilter, setProjectFilter] = useState<string | "">("")
  const [statusFilter, setStatusFilter] = useState<string | "">("")
  const [searchTerm, setSearchTerm] = useState("")
  const [taskToEdit, setTaskToEdit] = useState<CommentTask | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editStatus, setEditStatus] = useState<"NEU" | "OFFEN" | "ERLEDIGT">("NEU")
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const { toast } = useToast()

  const fetchTasks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getTasks({
        projectId: projectFilter || undefined,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      })
      setTasks(data)
    } catch (e) {
      setError("Fehler beim Laden der Aufgaben.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    async function loadProjects() {
      const p = await getProjects()
      setProjects(p)
    }
    loadProjects()
  }, [])

  useEffect(() => {
    if (user) fetchTasks()
  }, [user, projectFilter, statusFilter, searchTerm])

  const handleStatusChange = async (taskId: string, newStatus: "NEU" | "OFFEN" | "ERLEDIGT") => {
    const originalTasks = [...tasks]
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))) // Optimistic update

    const result = await updateTaskStatus(taskId, newStatus)
    if (!result.success) {
      toast({ title: "Fehler", description: "Status konnte nicht aktualisiert werden.", variant: "destructive" })
      setTasks(originalTasks) // Rollback
    } else {
      toast({ title: "Erfolg", description: "Status aktualisiert." })
      // fetchTasks(); // Oder nur das geänderte Element aktualisieren, wenn `result.task` zurückgegeben wird
    }
  }

  const handleDelete = async (taskId: string) => {
    const result = await deleteTask(taskId)
    if (result.success) {
      toast({ title: "Erfolg", description: "Aufgabe gelöscht." })
      fetchTasks()
    } else {
      toast({ title: "Fehler", description: "Aufgabe konnte nicht gelöscht werden.", variant: "destructive" })
    }
  }

  const openEditDialog = (task: CommentTask) => {
    setTaskToEdit(task)
    setEditContent(task.content)
    setEditStatus(task.status as "NEU" | "OFFEN" | "ERLEDIGT")
  }

  const handleEditSave = async () => {
    if (!taskToEdit) return
    setIsSavingEdit(true)
    const result = await updateTask(taskToEdit.id, { content: editContent, status: editStatus })
    if (result.success) {
      toast({ title: "Erfolg", description: "Aufgabe aktualisiert." })
      setTaskToEdit(null)
      fetchTasks()
    } else {
      toast({ title: "Fehler", description: "Aufgabe konnte nicht aktualisiert werden.", variant: "destructive" })
    }
    setIsSavingEdit(false)
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "ERLEDIGT") return "default" // Greenish in default theme
    if (status === "OFFEN") return "secondary" // Yellowish/Orangeish
    return "outline" // Neu
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (error) return <p className="text-red-500 p-4 bg-red-100 border border-red-500 rounded-md">{error}</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aufgaben & Kommentare</CardTitle>
        <CardDescription>Übersicht aller aktuellen Aufgaben und Kommentare.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={projectFilter || "all"}
            onValueChange={(v) => setProjectFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Baustelle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Baustellen</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => setStatusFilter(v === "all" ? "" : v as any)}
          >
            <SelectTrigger className="sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="NEU">Neu</SelectItem>
              <SelectItem value="OFFEN">Offen</SelectItem>
              <SelectItem value="ERLEDIGT">Erledigt</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="p-3 border rounded-md bg-card hover:shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <p className="text-sm whitespace-pre-wrap">{task.content}</p>
                  <div className="text-xs text-muted-foreground mt-1 space-x-2">
                    <span>
                      Erstellt von: {task.profiles?.full_name || task.profiles?.email || "Unbekannt"} am{" "}
                      {new Date(task.created_at).toLocaleDateString("de-DE")}
                    </span>
                    {task.projects && (
                      <span className="inline-flex items-center">
                        <Briefcase className="mr-1 h-3 w-3" /> {task.projects.name}
                      </span>
                    )}
                    {task.entries && (
                      <span className="inline-flex items-center">
                        <ListChecks className="mr-1 h-3 w-3" /> {task.entries.activity.substring(0, 30)}...
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 ml-2">
                  {task.is_procurement && <ShoppingCart className="h-5 w-5 text-blue-500" title="Besorgung" />}
                  <Badge variant={getStatusVariant(task.status)} className="text-xs">
                    {task.status}
                  </Badge>
                </div>
              </div>
              {(isAdmin || task.author_id === user?.id) && (
                <div className="mt-2 flex items-center justify-end gap-2">
                  <Select
                    value={task.status}
                    onValueChange={(newStatus: "NEU" | "OFFEN" | "ERLEDIGT") => handleStatusChange(task.id, newStatus)}
                  >
                    <SelectTrigger className="h-8 w-[100px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEU">Neu</SelectItem>
                      <SelectItem value="OFFEN">Offen</SelectItem>
                      <SelectItem value="ERLEDIGT">Erledigt</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(task.id)}
                    aria-label={`Aufgabe "${task.content.substring(0, 20)}..." löschen`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-5">Keine Aufgaben oder Kommentare vorhanden.</p>
        )}
      </CardContent>
    </Card>

      <Dialog open={!!taskToEdit} onOpenChange={(open) => !open && setTaskToEdit(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Aufgabe bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEU">Neu</SelectItem>
                  <SelectItem value="OFFEN">Offen</SelectItem>
                  <SelectItem value="ERLEDIGT">Erledigt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditSave} disabled={isSavingEdit}>
              {isSavingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}
