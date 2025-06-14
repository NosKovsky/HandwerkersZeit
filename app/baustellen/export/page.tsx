import { MainLayout } from "@/components/layout/main-layout"
import { getBaustellen } from "../actions"
import { ExportDialog } from "@/components/baustellen/export-dialog"

export default async function ExportPage() {
  const result = await getBaustellen()
  const baustellen = result.data || []

  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-4">
        <h1 className="text-2xl font-semibold">Baustellen exportieren</h1>
        {baustellen.length > 0 ? (
          <div className="space-y-4">
            {baustellen.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between border rounded-lg p-4"
              >
                <div>
                  <p className="font-medium">{b.name}</p>
                  {b.address && (
                    <p className="text-sm text-muted-foreground">{b.address}</p>
                  )}
                </div>
                <ExportDialog projectId={b.id} projectName={b.name} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Keine Baustellen gefunden.</p>
        )}
      </div>
    </MainLayout>
  )
}
