import { createSupabaseServerClient } from "@/lib/supabase/server"
import { BaustelleForm } from "@/components/baustellen/baustelle-form"
import BaustellenListAdminView from "@/components/baustellen/baustelle-list-admin-view"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { hasGoogleMapsApiKey } from "@/lib/google-maps-server"

async function getBaustellen() {
  const supabase = createSupabaseServerClient()
  try {
    const { data: baustellen, error } = await supabase.from("baustellen").select("*")

    if (error) {
      console.error("Error fetching baustellen:", error)
      return []
    }

    return baustellen
  } catch (error) {
    console.error("Unexpected error fetching baustellen:", error)
    return []
  }
}

export default async function BaustellenPage() {
  const baustellenData = await getBaustellen()
  const hasGoogleMaps = await hasGoogleMapsApiKey()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-5">Baustellen Management</h1>

      <Dialog>
        <DialogTrigger className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-5 inline-block">
          Neue Baustelle erstellen
        </DialogTrigger>
        <DialogContent>
          <BaustelleForm onSuccess={() => {}} hasGoogleMaps={hasGoogleMaps} />
        </DialogContent>
      </Dialog>

      <BaustellenListAdminView hasGoogleMaps={hasGoogleMaps} />
    </div>
  )
}
