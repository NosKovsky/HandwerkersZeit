import { MainLayout } from "@/components/layout/main-layout"
import { ReceiptList } from "@/components/receipts/receipt-list" // Erstellen wir als Nächstes
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ReceiptsPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <MainLayout>
      <ReceiptList />
    </MainLayout>
  )
}
