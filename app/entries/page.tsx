import { MainLayout } from "@/components/layout/main-layout"
import { EntryList } from "@/components/entries/entry-list" // Erstellen wir als Nächstes
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function EntriesPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <MainLayout>
      <EntryList />
    </MainLayout>
  )
}
