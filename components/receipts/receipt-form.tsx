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
import { Loader2, CalendarIcon, ImagePlus, Trash2, DollarSign, AlertCircle } from "lucide-react"
import { createReceipt, updateReceipt, type Receipt } from "@/app/receipts/actions"
import { getProjects } from "@/app/projects/actions"
import { getStorageUrl, STORAGE_BUCKETS } from "@/lib/supabase/storage"
import type { Database } from "@/lib/supabase/database.types"

type Project = Database["public"]["Tables"]["projects"]["Row"]

export const receiptCategories = [
  "Tankquittung",
  "Material Barzahlung",
  "Werkzeug",
  "Verpflegung",
  "Sonstiges",
]

const receiptSchema = z.object({
  receipt_date: z.string().min(1, "Datum ist erforderlich."),
  amount: z.coerce.number().positive("Betrag muss positiv sein."),
  company_name: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  project_id: z.string().uuid("Ungültige Projekt ID.").optional().nullable(),
})

type ReceiptFormData = z.infer<typeof receiptSchema>

interface ReceiptFormProps {
  receipt?: Receipt | null
  onSuccess?: () => void
}

export function ReceiptForm({ receipt, onSuccess }: ReceiptFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(receipt?.image_path || null)
  const [deleteExistingImage, setDeleteExistingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      receipt_date: receipt?.receipt_date || new Date().toISOString().split("T")[0],
      amount: receipt?.amount || 0,
      company_name: receipt?.company_name || "",
      category: receipt?.category || "",
      description: receipt?.description || "",
      project_id: receipt?.project_id || null,
    },
  })

  useEffect(() => {
    async function loadProjects() {
      try {
        const fetchedProjects = await getProjects()
        setProjects(fetchedProjects)
      } catch (error) {
        console.error("Error loading projects:", error)
        toast({
          title: "Fehler",
          description: "Projekte konnten nicht geladen werden.",
          variant: "destructive",
        })
      }
    }
    loadProjects()
  }, [toast])

  useEffect(() => {
    if (receipt) {
      reset({
        receipt_date: receipt.receipt_date,
        amount: receipt.amount,
        company_name: receipt.company_name || "",
        category: receipt.category || "",
        description: receipt.description || "",
        project_id: receipt.project_id || null,
      })
      setExistingImageUrl(receipt.image_path || null)
      setImageFile(null)
      setDeleteExistingImage(false)
    } else {
      reset({
        receipt_date: new Date().toISOString().split("T")[0],
        amount: 0,
        company_name: "",
        category: "",
        description: "",
        project_id: null,
      })
      setExistingImageUrl(null)
      setImageFile(null)
      setDeleteExistingImage(false)
    }
  }, [receipt, reset])

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]

    if (file.size > maxSize) {
      return "Datei zu groß (max. 10MB)"
    }

    if (!allowedTypes.includes(file.type)) {
      return "Dateityp nicht unterstützt"
    }

    return null
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      const error = validateFile(file)

      if (error) {
        toast({
          title: "Datei-Fehler",
          description: error,
          variant: "destructive",
        })
        return
      }

      setImageFile(file)
      setExistingImageUrl(null)
      setDeleteExistingImage(false)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (existingImageUrl) setDeleteExistingImage(true)
    setExistingImageUrl(null)
  }

  const onSubmit: SubmitHandler<ReceiptFormData> = async (data) => {
    setIsLoading(true)

    try {
      let result
      if (receipt) {
        result = await updateReceipt(receipt.id, data, imageFile || undefined, deleteExistingImage)
      } else {
        result = await createReceipt(data, imageFile || undefined)
      }

      if (result.success) {
        toast({
          title: "Erfolgreich",
          description: `Quittung wurde ${receipt ? "aktualisiert" : "erstellt"}.`,
        })

        // Form zurücksetzen
        reset()
        setImageFile(null)
        setExistingImageUrl(null)
        setDeleteExistingImage(false)
        if (fileInputRef.current) fileInputRef.current.value = ""

        router.refresh()
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Ein unbekannter Fehler ist aufgetreten.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Systemfehler",
        description: "Ein Fehler ist beim Speichern der Quittung aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const currentImageUrl = imageFile
    ? URL.createObjectURL(imageFile)
    : existingImageUrl
      ? getStorageUrl(STORAGE_BUCKETS.RECEIPT_IMAGES, existingImageUrl)
      : null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{receipt ? "Quittung Bearbeiten" : "Neue Quittung"}</CardTitle>
        <CardDescription>
          {receipt ? "Details dieser Quittung aktualisieren." : "Fügen Sie eine neue Quittung hinzu."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="receipt_date">Datum</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="receipt_date"
                  type="date"
                  {...register("receipt_date")}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.receipt_date && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.receipt_date.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Betrag (€)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("amount")}
                  className="pl-10"
                  disabled={isLoading}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company_name">Firma/Händler (Optional)</Label>
            <Input
              id="company_name"
              {...register("company_name")}
              disabled={isLoading}
              placeholder="z.B. Baumarkt XY"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Kategorie</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {receiptCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Beschreibung (Optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              disabled={isLoading}
              rows={2}
              placeholder="Zusätzliche Details zur Quittung..."
            />
          </div>

          <div className="space-y-2">
            <Label>Bild der Quittung (Optional)</Label>
            {currentImageUrl && !deleteExistingImage && (
              <div className="relative group w-32 h-32 border rounded-md">
                <img
                  src={currentImageUrl || "/placeholder.svg"}
                  alt="Quittungsvorschau"
                  className="w-full h-full object-contain rounded-md"
                  loading="lazy"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  onClick={removeImage}
                  disabled={isLoading}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            {!currentImageUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                Bild auswählen
              </Button>
            )}
            <Input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {receipt ? "Änderungen Speichern" : "Quittung Erstellen"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
