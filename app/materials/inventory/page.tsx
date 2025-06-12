import { MainLayout } from "@/components/layout/main-layout"
import { MaterialInventory } from "@/components/materials/material-inventory"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function MaterialInventoryPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <MainLayout>
      <MaterialInventory />
    </MainLayout>
  )
}
