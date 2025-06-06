"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react"
import { getTodosByProject, createTodo, toggleTodoCompletion, deleteTodo, type ProjectTodo } from "@/app/todos/actions"

interface ProjectTodoListProps {
  projectId: string
}

export function ProjectTodoList({ projectId }: ProjectTodoListProps) {
  const [todos, setTodos] = useState<ProjectTodo[]>([])
  const [newTodoContent, setNewTodoContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTodos()
  }, [projectId])

  const fetchTodos = async () => {
    setIsLoading(true)
    try {
      const todoData = await getTodosByProject(projectId)
      setTodos(todoData)
    } catch (error) {
      console.error("Error fetching todos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await createTodo({
        project_id: projectId,
        content: newTodoContent.trim(),
      })

      if (result.success && result.todo) {
        setTodos((prev) => [result.todo!, ...prev])
        setNewTodoContent("")
      }
    } catch (error) {
      console.error("Error creating todo:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleCompletion = async (todoId: string, currentStatus: boolean) => {
    try {
      const result = await toggleTodoCompletion(todoId, !currentStatus)
      if (result.success) {
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === todoId
              ? {
                  ...todo,
                  is_completed: !currentStatus,
                  completed_at: !currentStatus ? new Date().toISOString() : null,
                }
              : todo,
          ),
        )
      }
    } catch (error) {
      console.error("Error toggling todo:", error)
    }
  }

  const handleDeleteTodo = async (todoId: string) => {
    try {
      const result = await deleteTodo(todoId)
      if (result.success) {
        setTodos((prev) => prev.filter((todo) => todo.id !== todoId))
      }
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  const completedTodos = todos.filter((todo) => todo.is_completed)
  const pendingTodos = todos.filter((todo) => !todo.is_completed)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
            Aufgaben
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Lade Aufgaben...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
            Aufgaben
          </div>
          <div className="flex gap-2">
            {pendingTodos.length > 0 && <Badge variant="secondary">{pendingTodos.length} offen</Badge>}
            {completedTodos.length > 0 && <Badge variant="outline">{completedTodos.length} erledigt</Badge>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Neue Aufgabe hinzufügen */}
        <form onSubmit={handleAddTodo} className="flex gap-2">
          <Input
            value={newTodoContent}
            onChange={(e) => setNewTodoContent(e.target.value)}
            placeholder="Neue Aufgabe hinzufügen..."
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={isSubmitting || !newTodoContent.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {/* Offene Aufgaben */}
        {pendingTodos.length > 0 && (
          <div className="space-y-2">
            {pendingTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <button onClick={() => handleToggleCompletion(todo.id, todo.is_completed)} className="flex-shrink-0">
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </button>
                <span className="flex-1 text-sm">{todo.content}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Erledigte Aufgaben (eingeklappt) */}
        {completedTodos.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              {completedTodos.length} erledigte Aufgabe(n) anzeigen
            </summary>
            <div className="mt-2 space-y-2">
              {completedTodos.map((todo) => (
                <div key={todo.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <button onClick={() => handleToggleCompletion(todo.id, todo.is_completed)} className="flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </button>
                  <span className="flex-1 text-sm line-through text-muted-foreground">{todo.content}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </details>
        )}

        {todos.length === 0 && (
          <p className="text-center text-muted-foreground py-4">Noch keine Aufgaben für diese Baustelle.</p>
        )}
      </CardContent>
    </Card>
  )
}
