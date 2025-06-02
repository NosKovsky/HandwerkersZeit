"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast" // Annahme: Sie haben useToast von shadcn/ui
import { Loader2 } from "lucide-react"
import { createProject, updateProject } from "@/app/projects/actions" // Server Actions
import type { Database } from "@/lib/supabase/database.types"

type Project = Database["public"]["Tables"]["projects"]["Row"]

const projectSchema = z.object({
  name: z.string().min(3, "Name muss mindestens 3 Zeichen lang sein."),
  address: z.string().optional(),
  description: z.string().optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  project?: Project | null
  onSuccess?: () => void // Callback nach Erfolg, z.B. um Modal zu schließen
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || "",
      address: project?.address || "",
      description: project?.description || "",
    },
  })

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        address: project.address || "",
        description: project.description || "",
      })
    } else {
      reset({ name: "", address: "", description: "" })
    }
  }, [project, reset])

  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    setIsLoading(true)
    try {
      let result
      if (project) {
        // Update
        result = await updateProject(project.id, data)
      } else {
        // Create
        result = await createProject(data)
      }

      if (result.success) {
        toast({
          title: "Erfolgreich",
          description: `Projekt wurde ${project ? "aktualisiert" : "erstellt"}.`,
        })
        reset()
        router.refresh() // Aktualisiert die Daten auf der Client-Seite durch Neuladen der Server Components
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Ein unbekannter Fehler ist aufgetreten.",
          variant: "destructive",
        })
      }
    } catch (e) {
      toast({
        title: "Fehler",
        description: "Ein Fehler ist beim Speichern des Projekts aufgetreten.",
        variant: "destructive",
      })
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{project ? "Baustelle Bearbeiten" : "Neue Baustelle Erstellen"}</CardTitle>
        <CardDescription>
          {project ? "Aktualisieren Sie die Details dieser Baustelle." : "Fügen Sie eine neue Baustelle hinzu."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name der Baustelle</Label>
            <Input id="name" {...register("name")} disabled={isLoading} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Adresse (Optional)</Label>
            <Input id="address" {...register("address")} disabled={isLoading} />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Beschreibung (Optional)</Label>
            <Textarea id="description" {...register("description")} disabled={isLoading} rows={3} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {project ? "Änderungen Speichern" : "Baustelle Erstellen"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
