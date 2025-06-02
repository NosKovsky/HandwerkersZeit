// Diese Seite dient als Wrapper und entscheidet, was basierend auf der Rolle angezeigt wird.
// Admins sehen eine Verwaltungsansicht, normale Benutzer vielleicht nur eine Liste.
// Für dieses Beispiel fokussieren wir uns auf die Admin-Ansicht zum Verwalten.

import { MainLayout } from "@/components/layout/main-layout"
import { ProjectListAdminView } from "@/components/projects/project-list-admin-view" // Erstellen wir als Nächstes
import { createSupabaseServerClient } from "@/lib/supabase/server" // Für initialen Datenabruf
import { redirect } from "next/navigation"

// Diese Komponente wird serverseitig gerendert
export default async function ProjectsPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Hier könnte man entscheiden, welche Ansicht geladen wird,
  // basierend auf profile.role. Fürs Erste gehen wir davon aus,
  // dass diese Seite primär für Admins ist oder eine gemeinsame Liste zeigt,
  // und die Bearbeitungsfunktionen sind im ProjectListAdminView gekapselt.
  if (profile?.role !== "admin") {
    // Normale Benutzer könnten eine andere Ansicht bekommen oder hier eine Fehlermeldung/Weiterleitung
    // Fürs Erste: Einfache Liste für alle, aber Bearbeiten/Löschen nur für Admins in der Komponente
  }

  return (
    <MainLayout>
      <ProjectListAdminView />
    </MainLayout>
  )
}
