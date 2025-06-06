import { createSupabaseServerActionClient } from "@/lib/supabase/supabase-server"
import { getBaustellen } from "@/app/baustellen/actions"
import { redirect } from "next/navigation"
import { EntriesClientPage } from "@/components/entries/entries-client-page"
import { createEntry, updateEntry, deleteEntry, getEntries } from "./actions"

export default async function EntriesPage() {
  const supabase = createSupabaseServerActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Lade initiale Daten
  const { data: baustellenData } = await getBaustellen()
  const baustellen = baustellenData || []

  // Lade erste Seite der Einträge
  const initialEntries = await getEntries(user.id, undefined, undefined, undefined, undefined, 1, 10)

  return (
    <EntriesClientPage
      userId={user.id}
      baustellen={baustellen}
      initialEntries={initialEntries}
      createEntryAction={createEntry}
      updateEntryAction={updateEntry}
      deleteEntryAction={deleteEntry}
    />
  )
}
