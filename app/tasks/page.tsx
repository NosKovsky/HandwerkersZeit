"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import Layout from "@/components/layout"
import AuthGuard from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, MessageSquare, ShoppingCart, CheckCircle, Clock, AlertCircle, Send } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description: string | null
  status: "new" | "open" | "completed"
  is_shopping: boolean
  assignee_id: string | null
  created_at: string
  updated_at: string
  user_id: string
  profiles?: {
    name: string
    email: string
  }
  assignee?: {
    name: string
    email: string
  }
}

interface TaskComment {
  id: string
  task_id: string
  user_id: string
  comment: string
  created_at: string
  profiles?: {
    name: string
    email: string
  }
}

export default function TasksPage() {
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [comments, setComments] = useState<{ [key: string]: TaskComment[] }>({})
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_shopping: false,
    assignee_id: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filter, setFilter] = useState<"all" | "new" | "open" | "completed" | "my-tasks">("all")

  useEffect(() => {
    if (user) {
      fetchTasks()
      fetchUsers()
    }
  }, [user, filter])

  const fetchTasks = async () => {
    try {
      let query = supabase
        .from("tasks")
        .select(`
          *,
          profiles:user_id (name, email),
          assignee:assignee_id (name, email)
        `)
        .order("created_at", { ascending: false })

      if (filter === "my-tasks") {
        query = query.or(`user_id.eq.${user!.id},assignee_id.eq.${user!.id}`)
      } else if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (error) throw error
      setTasks(data || [])

      // Fetch comments for each task
      if (data) {
        for (const task of data) {
          await fetchTaskComments(task.id)
        }
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setError("Fehler beim Laden der Aufgaben")
    } finally {
      setLoading(false)
    }
  }

  const fetchTaskComments = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from("task_comments")
        .select(`
          *,
          profiles (name, email)
        `)
        .eq("task_id", taskId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setComments((prev) => ({ ...prev, [taskId]: data || [] }))
    } catch (error) {
      console.error("Error fetching task comments:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("id, name, email").order("name")

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase.from("tasks").insert({
        user_id: user!.id,
        title: formData.title,
        description: formData.description || null,
        is_shopping: formData.is_shopping,
        assignee_id: formData.assignee_id || null,
        status: "new",
      })

      if (error) throw error

      setSuccess("Aufgabe erfolgreich erstellt!")
      setFormData({
        title: "",
        description: "",
        is_shopping: false,
        assignee_id: "",
      })
      setShowForm(false)
      fetchTasks()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: "new" | "open" | "completed") => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", taskId)

      if (error) throw error
      fetchTasks()
      setSuccess(`Aufgabe als ${status === "completed" ? "erledigt" : status === "open" ? "offen" : "neu"} markiert`)
    } catch (error) {
      console.error("Error updating task status:", error)
      setError("Fehler beim Aktualisieren der Aufgabe")
    }
  }

  const addComment = async (taskId: string) => {
    if (!newComment.trim()) return

    try {
      const { error } = await supabase.from("task_comments").insert({
        task_id: taskId,
        user_id: user!.id,
        comment: newComment,
      })

      if (error) throw error

      setNewComment("")
      fetchTaskComments(taskId)
    } catch (error) {
      console.error("Error adding comment:", error)
      setError("Fehler beim Hinzufügen des Kommentars")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "open":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Neu"
      case "open":
        return "Offen"
      case "completed":
        return "Erledigt"
      default:
        return status
    }
  }

  if (loading && tasks.length === 0) {
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Aufgaben & Fragen</h1>
              <p className="mt-2 text-gray-600">Verwalten Sie Aufgaben, Fragen und Besorgungen</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Neue Aufgabe
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: "all", label: "Alle" },
              { key: "new", label: "Neu" },
              { key: "open", label: "Offen" },
              { key: "completed", label: "Erledigt" },
              { key: "my-tasks", label: "Meine Aufgaben" },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(tab.key as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Task Form Modal */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Neue Aufgabe</CardTitle>
                <CardDescription>Erstellen Sie eine neue Aufgabe oder Frage</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titel *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Kurze Beschreibung der Aufgabe"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Detaillierte Beschreibung (optional)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="assignee">Zugewiesen an</Label>
                    <Select
                      value={formData.assignee_id}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, assignee_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Person auswählen (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Niemand zugewiesen</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_shopping"
                      checked={formData.is_shopping}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_shopping: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="is_shopping" className="flex items-center">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Besorgung
                    </Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Wird erstellt..." : "Aufgabe erstellen"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tasks List */}
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          {task.is_shopping && (
                            <Badge variant="secondary" className="flex items-center">
                              <ShoppingCart className="mr-1 h-3 w-3" />
                              Besorgung
                            </Badge>
                          )}
                        </div>
                        {task.description && <p className="text-gray-600">{task.description}</p>}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Erstellt: {formatDateTime(task.created_at)}</span>
                          {task.assignee && (
                            <div className="flex items-center space-x-1">
                              <span>Zugewiesen an:</span>
                              <Avatar name={task.assignee.name || task.assignee.email} size="sm" />
                              <span>{task.assignee.name || task.assignee.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{getStatusLabel(task.status)}</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Status Update Buttons */}
                    {(profile?.role === "admin" || task.user_id === user?.id || task.assignee_id === user?.id) && (
                      <div className="flex space-x-2">
                        {task.status !== "open" && (
                          <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, "open")}>
                            Als offen markieren
                          </Button>
                        )}
                        {task.status !== "completed" && (
                          <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, "completed")}>
                            Als erledigt markieren
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="border-t pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                        className="mb-2"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Kommentare ({comments[task.id]?.length || 0})
                      </Button>

                      {selectedTask === task.id && (
                        <div className="space-y-3">
                          {/* Existing Comments */}
                          {comments[task.id]?.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <Avatar name={comment.profiles?.name || comment.profiles?.email} size="sm" />
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-sm">
                                      {comment.profiles?.name || comment.profiles?.email}
                                    </span>
                                    <span className="text-xs text-gray-500">{formatDateTime(comment.created_at)}</span>
                                  </div>
                                  <p className="text-sm">{comment.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Add Comment */}
                          <div className="flex space-x-2">
                            <Input
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Kommentar hinzufügen..."
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  addComment(task.id)
                                }
                              }}
                            />
                            <Button size="sm" onClick={() => addComment(task.id)} disabled={!newComment.trim()}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tasks.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Aufgaben</h3>
                <p className="mt-1 text-sm text-gray-500">Erstellen Sie Ihre erste Aufgabe.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </AuthGuard>
  )
}
