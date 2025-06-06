"use client"

import { useState, useEffect, useCallback } from "react"
import { createSupabaseClient } from "@/lib/supabase/client" // Client-seitiger Supabase Client
import { getEntries, deleteEntry as deleteEntryAction, type Entry, type PaginatedEntriesResponse } from "./actions"
import { EntryList } from "@/components/entries/entry-list"
import { EntryForm } from "@/components/entries/entry-form"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const PAGE_SIZE = 10

export default function EntriesPage() {
  const supabase = createSupabaseClient()
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
        // Hier wird angenommen, dass getEntries direkt aufgerufen werden kann
        // oder du erstellst eine serverseitige Route, die getEntries aufruft.
        // Für dieses Beispiel rufen wir es direkt auf, was im Client nicht ideal ist,
        // aber die Logik der Paginierung zeigt.
        // Besser: Eine Server Action, die Paginierungsparameter akzeptiert.
        // Da getEntries bereits in actions.ts ist, müssen wir es so anpassen, dass es
        // vom Client aufgerufen werden kann oder eine neue Action erstellen.
        // Für dieses Beispiel gehe ich davon aus, dass getEntries so angepasst wurde,
        // dass es ohne expliziten Supabase-Client-Parameter von einer Server-Komponente/Route
        // oder einer neuen Client-aufrufbaren Action genutzt wird.
        // Da wir hier in einer Client-Komponente sind und getEntries eine SupabaseClient-Instanz erwartet,
        // müssen wir eine Wrapper-Action erstellen oder getEntries anpassen.

        // Annahme: Es gibt eine Server Action, die getEntries mit Paginierung aufruft.
        // Nennen wir sie fetchPaginatedEntries in actions.ts
        // const data = await fetchPaginatedEntries(page, PAGE_SIZE); // Diese Action müsste erstellt werden

        // Temporäre direkte Nutzung (nicht empfohlen für Produktion ohne Server Action Wrapper)
        // Dies erfordert, dass getEntries in actions.ts so exportiert wird, dass es clientseitig
        // importiert werden kann und den Supabase Client als Argument akzeptiert.
        const data = await getEntries(supabase, page, PAGE_SIZE, {}) // Leere Filter für dieses Beispiel
        setEntriesResponse(data)
      } catch (error) {
        console.error("Error fetching entries:", error)
        toast({ title: "Fehler", description: "Einträge konnten nicht geladen werden.", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, toast],
  )

  useEffect(() => {
    fetchEntries(currentPage)
  }, [fetchEntries, currentPage])

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedEntry(null)
    // Lade die aktuelle Seite neu, um Änderungen zu sehen, oder idealerweise nur die erste Seite, wenn ein neuer Eintrag oben erscheint
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
      await deleteEntryAction(id) // Annahme: deleteEntryAction ist eine Server Action
      toast({ title: "Erfolg", description: "Eintrag gelöscht." })
      // Einträge neu laden, ggf. die aktuelle Seite oder die erste Seite
      fetchEntries(currentPage)
    } catch (error) {
      toast({ title: "Fehler", description: "Eintrag konnte nicht gelöscht werden.", variant: "destructive" })
    }
  }

  const totalPages = Math.ceil(entriesResponse.count / PAGE_SIZE)

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Arbeitseinträge</h1>
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
          <EntryForm entry={selectedEntry} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
