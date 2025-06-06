"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, ShoppingCart, Clock, CheckCircle, EyeOff, Building, Flame, Zap } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface TodoWithProject {
  id: string
  content: string
  priority: string
  category: string
  is_completed: boolean
  created_at: string
  project_id: string
  is_hidden_until?: string
  projects: {
    name: string
    address: string
  }
}

export function ImportantTodosWidget() {
  const { profile } = useAuth()
  const [todos, setTodos] = useState<TodoWithProject[]>([])
  const [loading, setLoading] = useState(true)
  const [hiddenTodos, setHiddenTodos] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchImportantTodos()
  }, [profile])

  const fetchImportantTodos = async () => {
    try {
      const { data, error } = await supabase
        .from("project_todos")
        .select(`
          id,
          content,
          priority,
          category,
          is_completed,
          created_at,
          project_id,
          is_hidden_until,
          projects!inner(name, address)
        `)
        .eq("is_completed", false)
        .in("priority", ["high", "urgent"])
        .or("category.eq.urgent_material,priority.eq.urgent")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching todos:", error)
        return
      }

      // Filter out hidden todos
      const now = new Date()
      const visibleTodos = (data || []).filter((todo: any) => {
        if (!todo.is_hidden_until) return true
        return new Date(todo.is_hidden_until) <= now
      })

      setTodos(visibleTodos)
    } catch (error) {
      console.error("Error fetching important todos:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTodoCompletion = async (todoId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from("project_todos")
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq("id", todoId)

      if (error) {
        toast.error("Fehler beim Aktualisieren der Aufgabe")
        return
      }

      // Remove from list if completed
      if (isCompleted) {
        setTodos((prev) => prev.filter((todo) => todo.id !== todoId))
        toast.success("✅ Aufgabe als erledigt markiert!")
      }
    } catch (error) {
      console.error("Error updating todo:", error)
      toast.error("Fehler beim Aktualisieren")
    }
  }

  const hideTodoTemporarily = async (todoId: string, hours: number) => {
    try {
      const hideUntil = new Date()
      hideUntil.setHours(hideUntil.getHours() + hours)

      const { error } = await supabase
        .from("project_todos")
        .update({ is_hidden_until: hideUntil.toISOString() })
        .eq("id", todoId)

      if (error) {
        toast.error("Fehler beim Ausblenden")
        return
      }

      setTodos((prev) => prev.filter((todo) => todo.id !== todoId))
      toast.success(`📅 Aufgabe für ${hours}h ausgeblendet`)
    } catch (error) {
      console.error("Error hiding todo:", error)
      toast.error("Fehler beim Ausblenden")
    }
  }

  const getPriorityColor = (priority: string, category: string) => {
    if (category === "urgent_material") return "bg-red-500"
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  const getPriorityIcon = (priority: string, category: string) => {
    if (category === "urgent_material") return <ShoppingCart className="h-4 w-4" />
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4" />
      case "high":
        return <Flame className="h-4 w-4" />
      case "medium":
        return <Zap className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getPriorityLabel = (priority: string, category: string) => {
    if (category === "urgent_material") return "🛒 HÄNDLER"
    switch (priority) {
      case "urgent":
        return "🚨 DRINGEND"
      case "high":
        return "🔥 WICHTIG"
      case "medium":
        return "⚡ MITTEL"
      default:
        return "📝 NORMAL"
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Lade wichtige Aufgaben...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 via-white to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          Wichtige Aufgaben
          {todos.length > 0 && <Badge className="bg-red-100 text-red-700 text-lg px-3 py-1">{todos.length}</Badge>}
        </CardTitle>
        <CardDescription className="text-lg">Dringende Aufgaben und Material-Besorgungen im Überblick</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {todos.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Alles erledigt! 🎉</h3>
            <p className="text-gray-600">Keine wichtigen Aufgaben offen.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todos.map((todo) => (
              <Card
                key={todo.id}
                className={`border-2 ${
                  todo.category === "urgent_material"
                    ? "border-red-300 bg-red-50"
                    : todo.priority === "urgent"
                      ? "border-red-300 bg-red-50"
                      : "border-orange-300 bg-orange-50"
                } hover:shadow-lg transition-shadow`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <Checkbox
                      checked={todo.is_completed}
                      onCheckedChange={(checked) => toggleTodoCompletion(todo.id, checked as boolean)}
                      className="mt-1"
                    />

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      {/* Priority Badge & Content */}
                      <div className="flex items-start gap-3">
                        <Badge
                          className={`${getPriorityColor(todo.priority, todo.category)} text-white flex items-center gap-1`}
                        >
                          {getPriorityIcon(todo.priority, todo.category)}
                          {getPriorityLabel(todo.priority, todo.category)}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-lg leading-relaxed">{todo.content}</p>
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{todo.projects.name}</span>
                        <span className="text-gray-400">•</span>
                        <span>{todo.projects.address}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => hideTodoTemporarily(todo.id, 2)}
                          className="text-xs"
                        >
                          <EyeOff className="h-3 w-3 mr-1" />
                          2h ausblenden
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => hideTodoTemporarily(todo.id, 24)}
                          className="text-xs"
                        >
                          <EyeOff className="h-3 w-3 mr-1" />1 Tag ausblenden
                        </Button>
                      </div>
                    </div>

                    {/* Time indicator */}
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(todo.created_at).toLocaleDateString("de-DE")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
