"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calendar } from "lucide-react"

interface ProjectTodo {
  id: string
  content: string
  is_completed: boolean
  priority: "low" | "medium" | "high" | null
  due_date: string | null
  created_at: string
  completed_at: string | null
}

interface ProjectTodoListProps {
  todos: ProjectTodo[]
  projectId: string
  onCreateTodo: (todoData: {
    content: string
    project_id: string
    priority?: string
    due_date?: string
  }) => Promise<void>
  onToggleTodo: (id: string, isCompleted: boolean) => Promise<void>
  onDeleteTodo: (id: string) => Promise<void>
}

export function ProjectTodoList({ todos, projectId, onCreateTodo, onToggleTodo, onDeleteTodo }: ProjectTodoListProps) {
  const [newTodoContent, setNewTodoContent] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateTodo = async () => {
    if (!newTodoContent.trim()) return

    await onCreateTodo({
      content: newTodoContent.trim(),
      project_id: projectId,
      priority: "medium",
    })

    setNewTodoContent("")
    setIsCreating(false)
  }

  const handleToggle = async (todo: ProjectTodo) => {
    await onToggleTodo(todo.id, !todo.is_completed)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Sind Sie sicher, dass Sie diese Aufgabe löschen möchten?")) {
      await onDeleteTodo(id)
    }
  }

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getPriorityLabel = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "Hoch"
      case "medium":
        return "Mittel"
      case "low":
        return "Niedrig"
      default:
        return "Normal"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Aufgaben</CardTitle>
          <Button size="sm" onClick={() => setIsCreating(true)} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Aufgabe
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCreating && (
          <div className="flex gap-2">
            <Input
              placeholder="Neue Aufgabe eingeben..."
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateTodo()
                } else if (e.key === "Escape") {
                  setIsCreating(false)
                  setNewTodoContent("")
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleCreateTodo}>
              Hinzufügen
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsCreating(false)
                setNewTodoContent("")
              }}
            >
              Abbrechen
            </Button>
          </div>
        )}

        {todos.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Noch keine Aufgaben vorhanden.</p>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  todo.is_completed ? "bg-muted/50" : "bg-background"
                }`}
              >
                <Checkbox checked={todo.is_completed} onCheckedChange={() => handleToggle(todo)} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${todo.is_completed ? "line-through text-muted-foreground" : ""}`}>
                    {todo.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getPriorityColor(todo.priority)} className="text-xs">
                      {getPriorityLabel(todo.priority)}
                    </Badge>
                    {todo.due_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(todo.due_date).toLocaleDateString("de-DE")}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(todo.created_at).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(todo.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
