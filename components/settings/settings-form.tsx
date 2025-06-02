"use client"

import { useState, useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { updateProfileName } from "@/app/settings/actions"
import { useAuth } from "@/contexts/auth-context" // Um Profil zu aktualisieren

const settingsSchema = z.object({
  full_name: z.string().min(2, "Name muss mindestens 2 Zeichen haben.").max(100),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface SettingsFormProps {
  currentFullName: string | null
}

export function SettingsForm({ currentFullName }: SettingsFormProps) {
  const { toast } = useToast()
  const { refreshProfile } = useAuth() // Um den AuthContext zu aktualisieren
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      full_name: currentFullName || "",
    },
  })

  useEffect(() => {
    reset({ full_name: currentFullName || "" })
  }, [currentFullName, reset])

  const onSubmit: SubmitHandler<SettingsFormData> = async (data) => {
    setIsLoading(true)
    const result = await updateProfileName(data.full_name)
    if (result.success) {
      toast({ title: "Erfolg", description: "Ihr Name wurde aktualisiert." })
      await refreshProfile() // AuthContext Profil neu laden, damit es im Layout etc. aktuell ist
      reset({ full_name: data.full_name }) // Setzt isDirty zurück
    } else {
      const errorMessage = typeof result.error === "string" ? result.error : result.error?.message
      toast({ title: "Fehler", description: errorMessage, variant: "destructive" })
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Vollständiger Name</Label>
        <Input id="full_name" {...register("full_name")} disabled={isLoading} />
        {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
      </div>
      <Button type="submit" disabled={isLoading || !isDirty}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Namen Speichern
      </Button>
    </form>
  )
}
