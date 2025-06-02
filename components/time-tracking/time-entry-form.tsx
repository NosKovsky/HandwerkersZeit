"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

type Project = {
  id: string
  name: string
}

export function TimeEntryForm() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState("")
  const [hours, setHours] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("id, name").eq("status", "active").order("name")

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const { error } = await supabase.from("time_entries").insert({
        project_id: selectedProject,
        user_id: user.id,
        description,
        hours: Number.parseFloat(hours),
        date,
      })

      if (error) throw error

      setSuccess(true)
      setSelectedProject("")
      setHours("")
      setDescription("")
      setDate(new Date().toISOString().split("T")[0])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Arbeitszeit erfassen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <Alert>
              <AlertDescription>Arbeitszeit wurde erfolgreich erfasst!</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="project">Projekt</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject} required>
              <SelectTrigger>
                <SelectValue placeholder="Projekt auswählen" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Datum</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Stunden</Label>
            <Input
              id="hours"
              type="number"
              step="0.25"
              min="0"
              max="24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
              disabled={loading}
              placeholder="z.B. 8.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Was haben Sie gearbeitet?"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !selectedProject}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Zeit erfassen
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
