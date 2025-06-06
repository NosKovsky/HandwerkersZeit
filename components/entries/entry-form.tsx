"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Entry } from "@/types/entry"
import type { Baustelle } from "@/app/baustellen/actions"

// Schema für die Validierung
const entryFormSchema = z.object({
  entry_date: z.date({
    required_error: "Bitte wählen Sie ein Datum.",
  }),
  entry_time: z.string().min(1, "Startzeit ist erforderlich."),
  end_time: z.string().min(1, "Endzeit ist erforderlich."),
  project_id: z.string().optional().nullable(),
  activity: z.string().min(3, "Tätigkeit muss mindestens 3 Zeichen haben."),
  notes: z.string().optional().nullable(),
  materials_used: z.string().optional().nullable(),
})

type EntryFormValues = z.infer<typeof entryFormSchema>

interface EntryFormProps {
  entry?: Entry | null
  onSuccess: () => void
  onSubmit: (data: any, imageFiles?: File[]) => Promise<any>
  userId: string
  baustellen: Baustelle[]
}

export function EntryForm({ entry, onSuccess, onSubmit, userId, baustellen }: EntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Standardwerte für das Formular
  const defaultValues: Partial<EntryFormValues> = {
    entry_date: entry ? new Date(entry.entry_date) : new Date(),
    entry_time: entry?.entry_time || "08:00",
    end_time: entry?.end_time || "17:00",
    project_id: entry?.project_id || "none", // Updated default value to be a non-empty string
    activity: entry?.activity || "",
    notes: entry?.notes || "",
    materials_used: entry?.materials_used ? JSON.stringify(entry.materials_used) : null,
  }

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues,
  })

  const handleSubmit = async (values: EntryFormValues) => {
    setIsSubmitting(true)
    try {
      // Formatiere das Datum für die API
      const formattedDate = format(values.entry_date, "yyyy-MM-dd")

      // Bereite die Daten für die Übermittlung vor
      const formData = {
        ...values,
        entry_date: formattedDate,
        user_id: userId,
        id: entry?.id, // Nur für Updates
      }

      // Rufe die übergebene onSubmit-Funktion auf
      const result = await onSubmit(formData)

      if (result.success) {
        onSuccess()
      } else {
        console.error("Error submitting form:", result.error)
        // Hier könnten Fehler im Formular angezeigt werden
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Datum */}
          <FormField
            control={form.control}
            name="entry_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Datum</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP", { locale: de }) : <span>Datum wählen</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Baustelle / Projekt */}
          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Baustelle</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "none"} // Updated default value to be a non-empty string
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Baustelle auswählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Keine Baustelle</SelectItem>
                    {baustellen.map((baustelle) => (
                      <SelectItem key={baustelle.id} value={baustelle.id}>
                        {baustelle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Startzeit */}
          <FormField
            control={form.control}
            name="entry_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Startzeit</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Endzeit */}
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endzeit</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tätigkeit */}
        <FormField
          control={form.control}
          name="activity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tätigkeit</FormLabel>
              <FormControl>
                <Input placeholder="Beschreiben Sie Ihre Tätigkeit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notizen */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notizen</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Zusätzliche Informationen"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onSuccess()}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {entry ? "Aktualisieren" : "Erstellen"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
