"use client"

import { useState, useEffect } from "react"
import { useForm, type SubmitHandler, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createTask } from "@/app/tasks/actions"
import { getProjects } from "@/app/projects/actions" // Für Projektauswahl
import type { Database } from "@/lib/supabase/database.types"

type Project = Database["public"]["Tables"]["projects"]["Row"]
// type EntryLight = { id: string; activity: string; entry_date: string }; // Vereinfachter Typ

const taskSchema = z.object({
  content: z.string().min(3, "Aufgabe/Kommentar muss mindestens 3 Zeichen haben."),
  project_id: z.string().uuid().optional().nullable(),
  entry_id: z.string().uuid().optional().nullable(),
  status: z.enum(["NEU", "OFFEN", "ERLEDIGT"]).default("NEU"),
  is_procurement: z.boolean().default(false),
  // recipient_ids: z.array(z.string().uuid()).optional(), // Für die Zukunft
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  defaultProjectId?: string | null
  defaultEntryId?: string | null
  onSuccess?: () => void
}

export function TaskForm({ defaultProjectId, defaultEntryId, onSuccess }: TaskFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [entries, setEntries] = useState<{ id: string; activity: string; entry_date: string }[]>([])
  const [entriesLoading, setEntriesLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      content: "",
      project_id: defaultProjectId || null,
      entry_id: defaultEntryId || null,
      status: "NEU",
      is_procurement: false,
    },
  })

  const projectId = watch("project_id")

  useEffect(() => {
    async function loadEntries() {
      if (!projectId) {
        setEntries([])
        setValue("entry_id", null)
        return
      }
      setEntriesLoading(true)
      try {
        const res = await fetch(`/api/entries-light?projectId=${projectId}`)
        if (res.ok) {
          const data = await res.json()
          setEntries(data)
        } else {
          setEntries([])
        }
      } catch (error) {
        console.error("Error loading entries:", error)
        setEntries([])
      } finally {
        setEntriesLoading(false)
      }
    }

    loadEntries()
  }, [projectId, setValue])

  useEffect(() => {
    async function loadData() {
      setProjects(await getProjects())
      if (defaultProjectId) {
        try {
          const res = await fetch(`/api/entries-light?projectId=${defaultProjectId}`)
          if (res.ok) {
            const data = await res.json()
            setEntries(data)
          }
        } catch (error) {
          console.error("Error loading default entries:", error)
        }
      }
    }
    loadData()
  }, [])


  const onSubmit: SubmitHandler<TaskFormData> = async (data) => {
    setIsLoading(true)
    const result = await createTask(data)
    if (result.success) {
      toast({ title: "Erfolg", description: "Aufgabe/Kommentar erstellt." })
      reset()
      if (onSuccess) onSuccess()
    } else {
      const errorMessage = typeof result.error === "string" ? result.error : result.error?.message
      toast({ title: "Fehler", description: errorMessage, variant: "destructive" })
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-1">
      <div>
        <Label htmlFor="content">Aufgabe / Kommentar</Label>
        <Textarea id="content" {...register("content")} rows={3} disabled={isLoading} />
        {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="project_id">Baustelle (Optional)</Label>
          <Controller
            name="project_id"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                value={field.value || "none"}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Baustelle auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Baustelle</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEU">Neu</SelectItem>
                  <SelectItem value="OFFEN">Offen</SelectItem>
                  <SelectItem value="ERLEDIGT">Erledigt</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="entry_id">Eintrag (Optional)</Label>
        <Controller
          name="entry_id"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(value) => field.onChange(value === "none" ? null : value)}
              value={field.value || "none"}
              disabled={entriesLoading || !projectId}
            >
              <SelectTrigger>
                <SelectValue placeholder={projectId ? "Eintrag auswählen..." : "Erst Projekt wählen"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Eintrag</SelectItem>
                {entries.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {new Date(e.entry_date).toLocaleDateString("de-DE")} – {e.activity.substring(0, 30)}
                  </SelectItem>
                ))}
                {projectId && !entriesLoading && entries.length === 0 && (
                  <SelectItem value="none" disabled>
                    Keine Einträge vorhanden
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Controller
          name="is_procurement"
          control={control}
          render={({ field }) => (
            <Checkbox id="is_procurement" checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
          )}
        />
        <Label
          htmlFor="is_procurement"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Besorgung 🛒
        </Label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Speichern
      </Button>
    </form>
  )
}
