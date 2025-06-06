"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CalendarIcon, ClockIcon, ImagePlus, Trash2, AlertCircle } from "lucide-react"
import { getStorageUrl, STORAGE_BUCKETS } from "@/lib/supabase/storage"
import type { Database } from "@/lib/supabase/database.types"
import { MaterialSelector, type SelectedMaterialItem } from "./material-selector"
import { useAuth } from "@/contexts/auth-context"

type BaustelleDb = Database["public"]["Tables"]["projects"]["Row"]
type EntryImage = Pick<Database["public"]["Tables"]["entry_images"]["Row"], "id" | "image_path" | "file_name">

const entrySchema = z
  .object({
    entry_date: z.string().min(1, "Datum ist erforderlich."),
    start_time: z.string().min(1, "Startzeit ist erforderlich."),
    end_time: z.string().min(1, "Endzeit ist erforderlich."),
    project_id: z.string().uuid("Ungültige Baustellen ID.").optional().nullable(),
    activity: z.string().min(3, "Tätigkeit muss mindestens 3 Zeichen haben."),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return data.start_time < data.end_time
      }
      return true
    },
    {
      message: "Endzeit muss nach der Startzeit liegen.",
      path: ["end_time"],
    },
  )

type EntryFormData = z.infer<typeof entrySchema>

interface EntryFormProps {
  entry?: any | null
  onSuccess?: () => void
  onSubmit?: (data: any, imageFiles?: File[]) => Promise<any>
  userId?: string
  baustellen?: BaustelleDb[]
}

export function EntryForm({ entry, onSuccess, onSubmit, userId, baustellen = [] }: EntryFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<EntryImage[]>(entry?.entry_images || [])
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      entry_date: entry?.entry_date || new Date().toISOString().split("T")[0],
      start_time: entry?.entry_time || "07:00",
      end_time: entry?.end_time || new Date().toTimeString().split(" ")[0].substring(0, 5),
      project_id: entry?.project_id || null,
      activity: entry?.activity || "",
      notes: entry?.notes || "",
    },
  })

  useEffect(() => {
    if (entry) {
      reset({
        entry_date: entry.entry_date,
        start_time: entry.entry_time,
        end_time: entry.end_time || new Date().toTimeString().split(" ")[0].substring(0, 5),
        project_id: entry.project_id || null,
        activity: entry.activity,
        notes: entry.notes || "",
      })

      try {
        const materials =
          typeof entry.materials_used === "string" ? JSON.parse(entry.materials_used) : entry.materials_used || []
        setSelectedMaterials(materials as SelectedMaterialItem[])
      } catch (error) {
        console.error("Error parsing materials:", error)
        setSelectedMaterials([])
      }

      setExistingImages(entry.entry_images || [])
      setImageFiles([])
      setDeletedImageIds([])
    } else {
      reset({
        entry_date: new Date().toISOString().split("T")[0],
        start_time: "07:00",
        end_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        project_id: null,
        activity: "",
        notes: "",
      })
      setSelectedMaterials([])
      setExistingImages([])
      setImageFiles([])
      setDeletedImageIds([])
    }
  }, [entry, reset])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
      setImageFiles((prevFiles) => [...prevFiles, ...files])
    }
  }

  const removeNewImage = (index: number) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageId: string) => {
    setExistingImages((prevImages) => prevImages.filter((img) => img.id !== imageId))
    setDeletedImageIds((prevIds) => [...prevIds, imageId])
  }

  const onSubmitForm: SubmitHandler<EntryFormData> = async (data) => {
    if (!user && !userId) {
      toast({ title: "Fehler", description: "Benutzer nicht angemeldet.", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const entryPayload = {
        ...data,
        entry_time: data.start_time,
        end_time: data.end_time,
        materials_used: JSON.stringify(selectedMaterials),
        project_id: data.project_id,
      }

      if (onSubmit) {
        const result = await onSubmit(entryPayload, imageFiles)
        if (result?.success) {
          toast({
            title: "Erfolgreich",
            description: `Eintrag wurde ${entry ? "aktualisiert" : "erstellt"}.`,
          })
          reset()
          setSelectedMaterials([])
          setImageFiles([])
          setExistingImages([])
          setDeletedImageIds([])
          router.refresh()
          if (onSuccess) onSuccess()
        } else {
          toast({
            title: "Fehler",
            description: result?.error || "Ein unbekannter Fehler ist aufgetreten.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Systemfehler",
        description: "Ein Fehler ist beim Speichern des Eintrags aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{entry ? "Eintrag Bearbeiten" : "Neuer Eintrag"}</CardTitle>
        <CardDescription>
          {entry ? "Details dieses Eintrags aktualisieren." : "Dokumentieren Sie Ihre Arbeit."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="entry_date">Datum</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="entry_date" type="date" {...register("entry_date")} className="pl-10" disabled={isLoading} />
              </div>
              {errors.entry_date && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.entry_date.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="start_time">Startzeit</Label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="start_time" type="time" {...register("start_time")} className="pl-10" disabled={isLoading} />
              </div>
              {errors.start_time && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.start_time.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end_time">Endzeit</Label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="end_time" type="time" {...register("end_time")} className="pl-10" disabled={isLoading} />
              </div>
              {errors.end_time && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.end_time.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
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
                    {baustellen.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.project_id && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.project_id.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="activity">Tätigkeit</Label>
            <Textarea
              id="activity"
              {...register("activity")}
              disabled={isLoading}
              rows={3}
              placeholder="Beschreiben Sie Ihre Tätigkeit..."
            />
            {errors.activity && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.activity.message}
              </p>
            )}
          </div>

          <MaterialSelector
            selectedMaterials={selectedMaterials}
            onChange={setSelectedMaterials}
            disabled={isLoading}
          />

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notizen (Optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              disabled={isLoading}
              rows={3}
              placeholder="Zusätzliche Notizen..."
            />
          </div>

          <div className="space-y-2">
            <Label>Bilder</Label>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
              <ImagePlus className="mr-2 h-4 w-4" />
              Bilder auswählen
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isLoading}
            />

            {(existingImages.length > 0 || imageFiles.length > 0) && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={getStorageUrl(STORAGE_BUCKETS.ENTRY_IMAGES, img.image_path) || "/placeholder.svg"}
                      alt={img.file_name || "Vorschau"}
                      className="w-full h-24 object-cover rounded-md"
                      loading="lazy"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeExistingImage(img.id!)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-md"
                      loading="lazy"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeNewImage(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {entry ? "Änderungen Speichern" : "Eintrag Erstellen"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
