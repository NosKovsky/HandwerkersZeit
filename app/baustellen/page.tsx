import { createSupabaseServerClient } from "@/lib/supabase/server"
import { BaustelleForm } from "@/components/baustellen/baustelle-form"
import BaustellenListAdminView from "@/components/baustellen/baustelle-list-admin-view"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

async function getBaustellen() {
  const supabase = createSupabaseServerClient()
  try {
    const { data: baustellen, error } = await supabase.from("baustellen").select("*")

    if (error) {
      console.error("Error fetching baustellen:", error)
      return []
    }

    return baustellen || []
  } catch (error) {
    console.error("Unexpected error fetching baustellen:", error)
    return []
  }
}

export default async function BaustellenPage() {
  const baustellenData = await getBaustellen()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🏗️ Baustellen</h1>
            <p className="text-muted-foreground mt-2">Verwalte alle deine Baustellen</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Neue Baustelle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <BaustelleForm onSuccess={() => {}} hasGoogleMaps={false} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <BaustellenListAdminView hasGoogleMaps={false} />
        </div>
      </div>
    </div>
  )
}
