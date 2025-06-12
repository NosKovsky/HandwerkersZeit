"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { getReceipts, deleteReceipt, type Receipt } from "@/app/receipts/actions"
import { getProjects } from "@/app/projects/actions"
import type { Database } from "@/lib/supabase/database.types"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { receiptCategories } from "./receipt-form"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Search, Loader2, Briefcase, CalendarDays, DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { ReceiptForm } from "./receipt-form"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"

type Project = Database["public"]["Tables"]["projects"]["Row"]

export function ReceiptList() {
  const { isAdmin, user } = useAuth()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const { toast } = useToast()

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects()
        setProjects(data)
      } catch (e) {
        console.error("Fehler beim Laden der Projekte", e)
      }
    }
    loadProjects()
  }, [])

  const fetchReceipts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getReceipts({
        projectId: selectedProject !== "all" ? selectedProject : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        dateFrom: dateRange?.from
          ? dateRange.from.toISOString().split("T")[0]
          : undefined,
        dateTo: dateRange?.to
          ? dateRange.to.toISOString().split("T")[0]
          : undefined,
      })
      setReceipts(data)
    } catch (e) {
      setError("Fehler beim Laden der Quittungen.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchReceipts()
  }, [user, selectedProject, categoryFilter, dateRange])

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedReceipt(null)
    fetchReceipts()
  }

  const openEditForm = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setIsFormOpen(true)
  }

  const openNewForm = () => {
    setSelectedReceipt(null)
    setIsFormOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!receiptToDelete) return
    setIsLoading(true)
    const result = await deleteReceipt(receiptToDelete.id)
    if (result.success) {
      toast({ title: "Erfolg", description: "Quittung gelöscht." })
      fetchReceipts()
    } else {
      const errorMessage = typeof result.error === "string" ? result.error : result.error?.message
      toast({ title: "Fehler", description: errorMessage, variant: "destructive" })
    }
    setReceiptToDelete(null)
    setIsLoading(false)
  }

  const filteredReceipts = receipts.filter(
    (r) =>
      r.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.amount.toString().includes(searchTerm) ||
      // @ts-ignore
      r.projects?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Meine Quittungen</h1>
        <Button onClick={openNewForm}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Neue Quittung
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Quittungen durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {receiptCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Projekt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Projekte</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
          className="w-auto"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Lade Quittungen...</p>
        </div>
      )}
      {error && <p className="text-red-500 p-4 bg-red-100 border border-red-500 rounded-md">{error}</p>}

      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredReceipts.length > 0 ? (
            filteredReceipts.map((receipt) => (
              <Card key={receipt.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {receipt.company_name || receipt.category || "Quittung"}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-1">
                        <span className="flex items-center">
                          <CalendarDays className="mr-1 h-3 w-3" />{" "}
                          {new Date(receipt.receipt_date).toLocaleDateString("de-DE")}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="mr-1 h-3 w-3" /> {receipt.amount.toFixed(2)} €
                        </span>
                        {/* @ts-ignore */}
                        {receipt.projects?.name && (
                          <span className="flex items-center">
                            <Briefcase className="mr-1 h-3 w-3" /> {receipt.projects.name}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {receipt.category && <Badge variant="outline">{receipt.category}</Badge>}
                      {(isAdmin || receipt.user_id === user?.id) && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditForm(receipt)}
                          >
                            <Edit className="h-4 w-4" /> <span className="sr-only">Bearbeiten</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setReceiptToDelete(receipt)}
                          >
                            <Trash2 className="h-4 w-4" /> <span className="sr-only">Löschen</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {receipt.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{receipt.description}</p>
                  )}
                  {receipt.image_path && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receiptimages/${receipt.image_path}`}
                        alt={receipt.company_name || "Quittungsbild"}
                        className="max-h-40 max-w-xs object-contain rounded-md border cursor-pointer"
                        onClick={() =>
                          window.open(
                            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receiptimages/${receipt.image_path}`,
                            "_blank",
                          )
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">Keine Quittungen gefunden.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <ReceiptForm receipt={selectedReceipt} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!receiptToDelete} onOpenChange={() => setReceiptToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quittung Löschen Bestätigen</DialogTitle>
            <DialogDescription>Sind Sie sicher, dass Sie diese Quittung endgültig löschen möchten?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
