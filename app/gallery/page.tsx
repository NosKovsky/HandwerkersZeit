import { MainLayout } from "@/components/layout/main-layout"
import { GalleryView } from "@/components/gallery/gallery-view" // Erstellen wir als Nächstes
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProjects } from "@/app/projects/actions" // Für den Projektfilter

export default async function GalleryPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const projects = await getProjects() // Für den Filter-Dropdown

  return (
    <MainLayout>
      <GalleryView projects={projects} />
    </MainLayout>
  )
}
