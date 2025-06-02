import { MainLayout } from "@/components/layout/main-layout"
import { MaterialListAdminView } from "@/components/materials/material-list-admin-view"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function MaterialsPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }
  // Weitere Rollenprüfungen können hier oder in der AdminView Komponente erfolgen

  return (
    <MainLayout>
      <MaterialListAdminView />
    </MainLayout>
  )
}
