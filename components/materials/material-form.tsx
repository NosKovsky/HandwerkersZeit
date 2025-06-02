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
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createMaterial, updateMaterial } from "@/app/materials/actions"
import type { Database } from "@/lib/supabase/database.types"

type Material = Database["public"]["Tables"]["materials"]["Row"]

const materialSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein."),
  unit: z.string().optional().nullable(), // z.B. "m", "Stk", "kg"
  description: z.string().optional().nullable(),
})

type MaterialFormData = z.infer<typeof materialSchema>

interface MaterialFormProps {
  material?: Material | null
  onSuccess?: () => void
}

export function MaterialForm({ material, onSuccess }: MaterialFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: material?.name || "",
      unit: material?.unit || "",
      description: material?.description || "",
    },
  })

  useEffect(() => {
    if (material) {
      reset({
        name: material.name,
        unit: material.unit || "",
        description: material.description || "",
      })
    } else {
      reset({ name: "", unit: "", description: "" })
    }
  }, [material, reset])

  const onSubmit: SubmitHandler<MaterialFormData> = async (data) => {
    setIsLoading(true)
    try {
      let result
      if (material) {
        result = await updateMaterial(material.id, data)
      } else {
        result = await createMaterial(data)
      }

      if (result.success) {
        toast({
          title: "Erfolgreich",
          description: `Material wurde ${material ? "aktualisiert" : "erstellt"}.`,
        })
        reset()
        router.refresh()
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
        description: "Ein Fehler ist beim Speichern des Materials aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{material ? "Material Bearbeiten" : "Neues Material Erstellen"}</CardTitle>
        <CardDescription>
          {material ? "Aktualisieren Sie die Details dieses Materials." : "Fügen Sie ein neues Material hinzu."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Materialbezeichnung</Label>
            <Input id="name" {...register("name")} disabled={isLoading} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit">Einheit (z.B. m, Stk, kg)</Label>
            <Input id="unit" {...register("unit")} disabled={isLoading} />
            {errors.unit && <p className="text-sm text-red-500">{errors.unit.message}</p>}
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
            {material ? "Änderungen Speichern" : "Material Erstellen"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
