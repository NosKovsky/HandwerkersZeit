"use client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { createBaustelle, updateBaustelle } from "@/app/baustellen/actions"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { DateRange } from "react-day-picker"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CustomerSelector } from "@/components/customers/customer-selector"
import type { Customer } from "@/app/customers/actions"
import { GoogleMaps } from "@/components/maps/google-maps"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  description: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  customer_id: z.string().nullable().optional(),
})

interface BaustelleFormProps {
  baustelle?: {
    id: string
    name: string
    address: string
    description?: string | null
    start_date?: Date | null
    end_date?: Date | null
    customer_id?: string | null
  }
  onSuccess?: () => void
  googleMapsApiKey?: string
}

export function BaustelleForm({ baustelle, onSuccess, googleMapsApiKey }: BaustelleFormProps) {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: baustelle?.name || "",
      address: baustelle?.address || "",
      description: baustelle?.description || "",
      start_date: baustelle?.start_date ? new Date(baustelle.start_date) : undefined,
      end_date: baustelle?.end_date ? new Date(baustelle.end_date) : undefined,
      customer_id: baustelle?.customer_id || null,
    },
  })

  const [date, setDate] = useState<DateRange | undefined>({
    from: baustelle?.start_date ? new Date(baustelle.start_date) : undefined,
    to: baustelle?.end_date ? new Date(baustelle.end_date) : undefined,
  })

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    if (baustelle?.customer_id) {
      // In a real app, you'd fetch the customer details here
      // For now, we just set the ID for the form
      form.setValue("customer_id", baustelle.customer_id)
    }
  }, [baustelle, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = {
      ...values,
      start_date: date?.from,
      end_date: date?.to,
      customer_id: selectedCustomer?.id || values.customer_id,
    }

    const result = baustelle ? await updateBaustelle(baustelle.id, formData) : await createBaustelle(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(baustelle ? "Baustelle aktualisiert" : "Baustelle erstellt")
      router.refresh()
      if (onSuccess) onSuccess()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name der Baustelle" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomerSelector
          selectedCustomer={selectedCustomer}
          onCustomerSelect={setSelectedCustomer}
          onCustomerDataChange={(customerData) => {
            if (customerData.address) {
              form.setValue("address", customerData.address || "")
            }
          }}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="Adresse der Baustelle" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {googleMapsApiKey && <GoogleMaps address={form.watch("address")} apiKey={googleMapsApiKey} />}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschreibung</FormLabel>
              <FormControl>
                <Textarea placeholder="Beschreibe die Baustelle" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start- & Enddatum</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-[240px] pl-3 text-left font-normal", !date?.from && "text-muted-foreground")}
                    >
                      {date?.from ? (
                        date.to ? (
                          `${format(date.from, "dd.MM.yyyy", { locale: de })} - ${format(date.to, "dd.MM.yyyy", { locale: de })}`
                        ) : (
                          format(date.from, "dd.MM.yyyy", { locale: de })
                        )
                      ) : (
                        <span>Datum auswählen</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Speichern</Button>
      </form>
    </Form>
  )
}
