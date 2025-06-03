import { MainLayout } from "@/components/layout/main-layout"
import { UserManagement } from "@/components/users/user-management"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function UsersPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Sicherstellen, dass nur Admins Zugriff haben
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Alle Benutzer laden
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Benutzerverwaltung</h1>
        <UserManagement initialUsers={users || []} />
      </div>
    </MainLayout>
  )
}
