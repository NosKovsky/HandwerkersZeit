"use client"

import { useState, useEffect, useCallback } from "react"
import { createSupabaseClient, createSupabaseServerActionClient } from "@/lib/supabase/client" // Client-seitiger Supabase Client
import { getEntries, createEntry, updateEntry, deleteEntry, type Entry, type PaginatedEntriesResponse } from "./actions"
import { getBaustellen } from "@/app/baustellen/actions"
import { EntriesClientPage } from "@/components/entries/entries-client-page"
import { useToast } from "@/components/ui/use-toast"
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

  // Lade initiale Daten
  const { data: baustellenData } = await getBaustellen()
  const baustellen = baustellenData || []

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
    <EntriesClientPage
      userId={user.id}
      baustellen={baustellen}
      createEntryAction={createEntry}
      updateEntryAction={updateEntry}
      deleteEntryAction={deleteEntry}
      getEntriesAction={getEntries}
    />
  )
}
