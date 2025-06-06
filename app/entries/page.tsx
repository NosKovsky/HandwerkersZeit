"use client"

import { useState, useEffect, useCallback } from "react"
import { createSupabaseClient, createSupabaseServerActionClient } from "@/lib/supabase/client" // Client-seitiger Supabase Client
import { getEntries, createEntry, updateEntry, deleteEntry, type Entry, type PaginatedEntriesResponse } from "./actions"
import { EntryList } from "@/components/entries/entry-list"
import { EntryForm } from "@/components/entries/entry-form"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { redirect } from "next/navigation"

const PAGE_SIZE = 10

export default async function EntriesPage() {
  const supabaseServer = await createSupabaseServerActionClient()
  const {
    data: { user },
  } = await supabaseServer.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const supabaseClient = createSupabaseClient()
  const [entriesResponse, setEntriesResponse] = useState<PaginatedEntriesResponse>({ entries: [], count: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const fetchEntries = useCallback(
    async (page: number) => {
      setIsLoading(true)
      try {
        const data = await getEntries(supabaseClient, user.id, page, PAGE_SIZE, {}) // Leere Filter für dieses Beispiel
        setEntriesResponse(data)
      } catch (error) {
        console.error("Error fetching entries:", error)
        toast({ title: "Fehler", description: "Einträge konnten nicht geladen werden.", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    },
    [supabaseClient, user.id, toast],
  )

  useEffect(() => {
    fetchEntries(currentPage)
  }, [fetchEntries, currentPage])

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedEntry(null)
    fetchEntries(currentPage)
  }

  const openEditForm = (entry: Entry) => {
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
      await deleteEntry(id) // Annahme: deleteEntry ist eine Server Action
      toast({ title: "Erfolg", description: "Eintrag gelöscht." })
      fetchEntries(currentPage)
    } catch (error) {
      toast({ title: "Fehler", description: "Eintrag konnte nicht gelöscht werden.", variant: "destructive" })
    }
  }

  const totalPages = Math.ceil(entriesResponse.count / PAGE_SIZE)

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Zeiterfassung</h1>
        <Button onClick={openNewForm}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Neuer Eintrag
        </Button>
      </div>

      {isLoading && entriesResponse.entries.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Lade Einträge...</p>
        </div>
      ) : (
        <>
          <EntryList entries={entriesResponse.entries} onDelete={handleDelete} onEdit={openEditForm} />
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                variant="outline"
              >
                Zurück
              </Button>
              <span className="text-sm text-muted-foreground">
                Seite {currentPage} von {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                variant="outline"
              >
                Weiter
              </Button>
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground mt-2">Gesamt: {entriesResponse.count} Einträge</p>
        </>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEntry ? "Eintrag Bearbeiten" : "Neuer Eintrag Erstellen"}</DialogTitle>
          </DialogHeader>
          <EntryForm
            entry={selectedEntry}
            onSuccess={handleFormSuccess}
            onSubmit={selectedEntry ? updateEntry : createEntry}
            userId={user.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
