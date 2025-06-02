"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SelectedMaterialItem } from "@/types/index"

import { useState, useEffect } from "react"
import { getEntries, deleteEntry, type Entry } from "@/app/entries/actions"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Search, Loader2, Briefcase, CalendarDays } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { EntryForm } from "./entry-form"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

export function EntryList() {
  const { isAdmin, user } = useAuth()
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("") // TODO: Filter implementieren
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null)

  const { toast } = useToast()

  const fetchEntries = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: Filter an getEntries übergeben
      const data = await getEntries()
      setEntries(data)
    } catch (e) {
      setError("Fehler beim Laden der Einträge.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      // Nur laden, wenn Benutzer vorhanden
      fetchEntries()
    }
  }, [user]) // Abhängigkeit von user hinzugefügt

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedEntry(null)
    fetchEntries()
  }

  const openEditForm = (entry: Entry) => {
    setSelectedEntry(entry)
    setIsFormOpen(true)
  }

  const openNewForm = () => {
    setSelectedEntry(null)
    setIsFormOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return
    setIsLoading(true)
    const result = await deleteEntry(entryToDelete.id)
    if (result.success) {
      toast({ title: "Erfolg", description: "Eintrag gelöscht." })
      fetchEntries()
    } else {
      const errorMessage = typeof result.error === "string" ? result.error : result.error?.message
      toast({ title: "Fehler", description: errorMessage, variant: "destructive" })
    }
    setEntryToDelete(null)
    setIsLoading(false)
  }

  // TODO: Implement client-side filtering based on searchTerm or enhance server action
  const filteredEntries = entries.filter(
    (entry) =>
      entry.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // @ts-ignore
      entry.projects?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Meine Einträge</h1>
        <Button onClick={openNewForm}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Neuer Eintrag
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Einträge durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Lade Einträge...</p>
        </div>
      )}
      {error && <p className="text-red-500 p-4 bg-red-100 border border-red-500 rounded-md">{error}</p>}

      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{entry.activity}</CardTitle>
                    <div className="flex items-center gap-2">
                      {(isAdmin || entry.user_id === user?.id) && (
                        <>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditForm(entry)}>
                            <Edit className="h-4 w-4" /> <span className="sr-only">Bearbeiten</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEntryToDelete(entry)}
                          >
                            <Trash2 className="h-4 w-4" /> <span className="sr-only">Löschen</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="flex items-center">
                      <CalendarDays className="mr-1 h-3 w-3" /> {new Date(entry.entry_date).toLocaleDateString("de-DE")}{" "}
                      {entry.entry_time}
                    </span>
                    {/* @ts-ignore */}
                    {entry.projects?.name && (
                      <span className="flex items-center">
                        <Briefcase className="mr-1 h-3 w-3" /> {entry.projects.name}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {entry.notes && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.notes}</p>}
                  {/* @ts-ignore */}
                  {entry.materials_used &&
                    (JSON.parse(entry.materials_used as string) as SelectedMaterialItem[]).length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold">Material:</h4>
                        <ul className="list-disc list-inside pl-1 text-xs">
                          {/* @ts-ignore */}
                          {(JSON.parse(entry.materials_used as string) as SelectedMaterialItem[]).map((m) => (
                            <li key={m.material_id}>
                              {m.quantity} {m.unit || ""} {m.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {entry.entry_images && entry.entry_images.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-semibold mb-1">Bilder:</h4>
                      <div className="flex flex-wrap gap-2">
                        {entry.entry_images.map((img) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={img.id}
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/entryimages/${img.image_path}`}
                            alt={img.file_name || "Eintragsbild"}
                            className="h-16 w-16 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">
                  Keine Einträge gefunden.
                  {searchTerm && " Versuchen Sie einen anderen Suchbegriff oder erstellen Sie einen neuen Eintrag."}
                  {!searchTerm && " Erstellen Sie Ihren ersten Eintrag!"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* DialogHeader wird in EntryForm gesetzt */}
          <EntryForm entry={selectedEntry} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eintrag Löschen Bestätigen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diesen Eintrag endgültig löschen möchten? Diese Aktion kann nicht rückgängig
              gemacht werden.
            </DialogDescription>
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
