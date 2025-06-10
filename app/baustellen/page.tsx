import { MainLayout } from "@/components/layout/main-layout"
import { getBaustellen } from "./actions"
import BaustellenListAdminView from "@/components/baustellen/baustelle-list-admin-view"

export default async function BaustellenPage() {
  try {
    const result = await getBaustellen()
    const baustellen = result?.data || []

    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <BaustellenListAdminView
            baustellen={baustellen}
            onDelete={async (id: string) => {
              "use server"
              // Delete logic here
            }}
            onUpdate={async (id: string, data: any) => {
              "use server"
              // Update logic here
            }}
            onCreate={async (data: any) => {
              "use server"
              // Create logic here
            }}
          />
        </div>
      </MainLayout>
    )
  } catch (error) {
    console.error("Error loading baustellen:", error)
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <p className="text-red-500">Fehler beim Laden der Baustellen</p>
          </div>
        </div>
      </MainLayout>
    )
  }
}
