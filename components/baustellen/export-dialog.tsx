"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, FileDown } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { exportBaustellenData, type ExportFormat } from "@/app/baustellen/export/actions"
import { toast } from "sonner"

interface ExportDialogProps {
  projectId: string
  projectName: string
}

export function ExportDialog({ projectId, projectName }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState({
    includeEntries: true,
    includeMaterials: true,
    includeTodos: true,
    includeImages: false,
    format: "csv" as ExportFormat,
    useCustomDateRange: false,
    dateRange: {
      from: new Date(),
      to: new Date(),
    },
  })

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const result = await exportBaustellenData({
        projectId,
        includeEntries: options.includeEntries,
        includeMaterials: options.includeMaterials,
        includeTodos: options.includeTodos,
        includeImages: options.includeImages,
        format: options.format,
        dateRange: options.useCustomDateRange
          ? {
              from: format(options.dateRange.from, "yyyy-MM-dd"),
              to: format(options.dateRange.to, "yyyy-MM-dd"),
            }
          : undefined,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success && result.data) {
        // CSV-Datei zum Download anbieten
        const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", result.filename || `baustelle-export.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success("Export erfolgreich")
        setOpen(false)
      }
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Beim Export ist ein Fehler aufgetreten")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Exportieren
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Baustelle exportieren</DialogTitle>
          <DialogDescription>
            Wählen Sie die Daten aus, die Sie für die Baustelle &quot;{projectName}&quot; exportieren möchten.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="font-medium">Zu exportierende Daten:</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeEntries"
                  checked={options.includeEntries}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeEntries: checked === true }))}
                />
                <Label htmlFor="includeEntries">Zeiteinträge</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMaterials"
                  checked={options.includeMaterials}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeMaterials: checked === true }))}
                />
                <Label htmlFor="includeMaterials">Materialien</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTodos"
                  checked={options.includeTodos}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeTodos: checked === true }))}
                />
                <Label htmlFor="includeTodos">Aufgaben</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeImages"
                  checked={options.includeImages}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeImages: checked === true }))}
                  disabled={true}
                />
                <Label htmlFor="includeImages" className="text-muted-foreground">
                  Bilder (bald verfügbar)
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-medium">Zeitraum:</div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useCustomDateRange"
                checked={options.useCustomDateRange}
                onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, useCustomDateRange: checked === true }))}
              />
              <Label htmlFor="useCustomDateRange">Bestimmten Zeitraum auswählen</Label>
            </div>

            {options.useCustomDateRange && (
              <div className="grid gap-2">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="dateRange">Zeitraum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="dateRange"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !options.dateRange && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {options.dateRange?.from ? (
                          options.dateRange.to ? (
                            <>
                              {format(options.dateRange.from, "dd.MM.yyyy", { locale: de })} -{" "}
                              {format(options.dateRange.to, "dd.MM.yyyy", { locale: de })}
                            </>
                          ) : (
                            format(options.dateRange.from, "dd.MM.yyyy", { locale: de })
                          )
                        ) : (
                          <span>Zeitraum auswählen</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={options.dateRange?.from}
                        selected={{
                          from: options.dateRange?.from,
                          to: options.dateRange?.to,
                        }}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setOptions((prev) => ({
                              ...prev,
                              dateRange: {
                                from: range.from,
                                to: range.to,
                              },
                            }))
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="font-medium">Format:</div>
            <RadioGroup
              defaultValue="csv"
              value={options.format}
              onValueChange={(value) => setOptions((prev) => ({ ...prev, format: value as ExportFormat }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV (Excel, LibreOffice Calc)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" disabled />
                <Label htmlFor="excel" className="text-muted-foreground">
                  Excel (bald verfügbar)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" disabled />
                <Label htmlFor="pdf" className="text-muted-foreground">
                  PDF (bald verfügbar)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? (
              <>Exportiere...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
