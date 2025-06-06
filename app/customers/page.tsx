import { createSupabaseServerClient } from "@/lib/supabase/server"
import CustomerManagement from "@/components/customers/customer-management"

async function getCustomers() {
  const supabase = createSupabaseServerClient()
  try {
    const { data: customers, error } = await supabase.from("customers").select("*")

    if (error) {
      console.error("Error fetching customers:", error)
      return []
    }

    return customers || []
  } catch (error) {
    console.error("Unexpected error fetching customers:", error)
    return []
  }
}

export default async function CustomersPage() {
  const customersData = await getCustomers()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">👥 Kunden</h1>
          <p className="text-muted-foreground mt-2">Verwalte deine Kundendaten</p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <CustomerManagement initialCustomers={customersData} hasGoogleMaps={false} />
        </div>
      </div>
    </div>
  )
}
