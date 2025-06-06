"use client"

import { useState, useEffect, useCallback } from "react"
import { EntryList } from "@/components/entries/entry-list"
import { EntryForm } from "@/components/entries/entry-form"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EntriesClientPageProps {
  userId: string
  baustellen: any[]
  createEntryAction: any
  updateEntryAction: any
  deleteEntryAction: any
  getEntriesAction: any
}

export function EntriesClientPage({
  userId,
  baustellen,
  createEntryAction,
  updateEntryAction,
  deleteEntryAction,
  getEntriesAction,
}: EntriesClientPageProps) {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null)
  const { toast } = useToast()

  const fetchEntries = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getEntriesAction(userId)
      if (result.entries) {
        setEntries(result.entries)
      }
    } catch (error) {
      console.error("Error fetching entries:", error)
      toast({ title: "Fehler", description: "Einträge konnten nicht geladen werden.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [userId, getEntriesAction, toast])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedEntry(null)
    fetchEntries()
  }

  const openEditForm = (entry: any) => {
    setSelectedEntry(entry)
    setIsFormOpen(true)
  }

  const openNewForm = () => {
    setSelectedEntry(null)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Möchten Sie diesen Eintrag wirklich löschen?")
    if (!confirmed) return

    try {
      await deleteEntryAction(id)
      toast({ title: "Erfolg", description: "Eintrag gelöscht." })
      fetchEntries()
    } catch (error) {
      toast({ title: "Fehler", description: "Eintrag konnte nicht gelöscht werden.", variant: "destructive" })
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Zeiterfassung</h1>
        <Button onClick={openNewForm}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Neuer Eintrag
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Lade Einträge...</p>
        </div>
      ) : (
        <EntryList entries={entries} onDelete={handleDelete} onEdit={openEditForm} />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEntry ? "Eintrag Bearbeiten" : "Neuer Eintrag Erstellen"}</DialogTitle>
          </DialogHeader>
          <EntryForm
            entry={selectedEntry}
            onSuccess={handleFormSuccess}
            onSubmit={selectedEntry ? updateEntryAction : createEntryAction}
            userId={userId}
            baustellen={baustellen}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
