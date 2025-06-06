import { createSupabaseServerClient } from "@/lib/supabase/server"
import CustomerManagement from "@/components/customers/customer-management"
import { hasGoogleMapsApiKey } from "@/lib/google-maps-server"

async function getCustomers() {
  const supabase = createSupabaseServerClient()
  try {
    const { data: customers, error } = await supabase.from("customers").select("*")

    if (error) {
      console.error("Error fetching customers:", error)
      return []
    }

    return customers
  } catch (error) {
    console.error("Unexpected error fetching customers:", error)
    return []
  }
}

export default async function CustomersPage() {
  const customersData = await getCustomers()
  const hasGoogleMaps = await hasGoogleMapsApiKey()

  return (
    <div>
      <CustomerManagement initialCustomers={customersData || []} hasGoogleMaps={hasGoogleMaps} />
    </div>
  )
}
