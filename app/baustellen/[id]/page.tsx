import { getBaustelleById } from "@/app/baustellen/actions"
import { getEntries } from "@/app/entries/actions"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getStorageUrl, STORAGE_BUCKETS } from "@/lib/supabase/storage"
import { ArrowLeft, Clock, ExternalLink, ImageIcon, MapPin, Package, Briefcase, User, Phone } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cn } from "@/lib/utils"
import type { SelectedMaterialItem } from "@/components/entries/material-selector"
import { ProjectTodoList } from "@/components/todos/project-todo-list"
import { ExportDialog } from "@/components/baustellen/export-dialog"
import { GoogleMapsServer } from "@/components/google-maps-server"
import { getGoogleMapsSearchUrl, hasGoogleMapsApiKey } from "@/lib/google-maps-server"

type BaustellePageProps = {
  params: { id: string }
}

// Hilfsfunktion zur Berechnung der Dauer
const calculateDurationInHours = (startTime: string, endTime: string | null | undefined): number => {
  if (!endTime) return 0
  const start = new Date(`1970-01-01T${startTime}`)
  const end = new Date(`1970-01-01T${endTime}`)
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0
  const diffMs = end.getTime() - start.getTime()
  return diffMs / (1000 * 60 * 60)
}

export default async function BaustelleDetailPage({ params }: BaustellePageProps) {
  const baustelleId = params.id
  const baustelle = await getBaustelleById(baustelleId)

  if (!baustelle) {
    notFound()
  }

  const entries = await getEntries({ projectId: baustelleId })
  const hasGoogleMaps = await hasGoogleMapsApiKey()

  let totalHours = 0
  const aggregatedMaterials: { [key: string]: { name: string; quantity: number; unit: string | null } } = {}
  const images: { id: string; path: string; alt: string }[] = []

  entries.forEach((entry) => {
    totalHours += calculateDurationInHours(entry.entry_time, entry.end_time)

    if (entry.materials_used) {
      try {
        const materials = (
          typeof entry.materials_used === "string" ? JSON.parse(entry.materials_used) : entry.materials_used
        ) as SelectedMaterialItem[]
        materials.forEach((mat) => {
          if (aggregatedMaterials[mat.material_id]) {
            aggregatedMaterials[mat.material_id].quantity += mat.quantity
          } else {
            aggregatedMaterials[mat.material_id] = {
              name: mat.name,
              quantity: mat.quantity,
              unit: mat.unit || null,
            }
          }
        })
      } catch (e) {
        console.error("Error parsing materials_used for entry:", entry.id, e)
      }
    }
    entry.entry_images?.forEach((img) => {
      images.push({
        id: img.id!,
        path: getStorageUrl(STORAGE_BUCKETS.ENTRY_IMAGES, img.image_path) || "/placeholder.svg",
        alt: img.file_name || `Bild von Baustelle ${baustelle.name}`,
      })
    })
  })

  const googleMapsUrl = baustelle.address
    ? await getGoogleMapsSearchUrl(baustelle.address)
    : await getGoogleMapsSearchUrl(baustelle.name)

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/baustellen" className={cn(buttonVariants({ variant: "outline" }), "flex items-center")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zu Baustellen
        </Link>
        <ExportDialog projectId={baustelleId} projectName={baustelle.name} />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl lg:text-3xl">{baustelle.name}</CardTitle>
          <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
            {baustelle.address && (
              <span className="flex items-center mt-1 sm:mt-0">
                <MapPin className="mr-1.5 h-4 w-4" /> {baustelle.address}
              </span>
            )}
            <span
              className={cn(
                "mt-1 sm:mt-0 px-2 py-0.5 rounded-full text-xs font-medium",
                baustelle.status === "Aktiv" && "bg-green-100 text-green-700",
                baustelle.status === "In Arbeit" && "bg-yellow-100 text-yellow-700",
                baustelle.status === "Abgeschlossen" && "bg-gray-100 text-gray-700",
              )}
            >
              Status: {baustelle.status || "Unbekannt"}
            </span>
          </CardDescription>
          {baustelle.customers && (
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <User className="mr-1.5 h-4 w-4" />
              <span className="font-medium">{baustelle.customers.name}</span>
              {baustelle.customers.contact_person && (
                <span className="ml-2">({baustelle.customers.contact_person})</span>
              )}
              {baustelle.customers.phone && (
                <span className="ml-4">
                  <Phone className="inline mr-1 h-3 w-3" />
                  <a href={`tel:${baustelle.customers.phone}`} className="hover:underline">
                    {baustelle.customers.phone}
                  </a>
                </span>
              )}
            </div>
          )}
        </CardHeader>
        {baustelle.description && (
          <CardContent>
            <p className="text-muted-foreground">{baustelle.description}</p>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gearbeitete Stunden */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Arbeitsstunden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalHours.toFixed(1)} Std.</p>
            <p className="text-sm text-muted-foreground">Gesamte erfasste Arbeitszeit</p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">Basierend auf {entries.length} Einträgen.</p>
          </CardFooter>
        </Card>

        {/* Materialverbrauch */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Package className="mr-2 h-5 w-5 text-primary" />
              Materialverbrauch
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(aggregatedMaterials).length > 0 ? (
              <ul className="space-y-1 text-sm">
                {Object.values(aggregatedMaterials).map((mat) => (
                  <li key={mat.name}>
                    {mat.quantity} {mat.unit || ""} - {mat.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Kein Material erfasst.</p>
            )}
          </CardContent>
        </Card>

        {/* Google Maps */}
        {baustelle.address && hasGoogleMaps && (
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Standort
              </CardTitle>
            </CardHeader>
            <CardContent className="aspect-video p-0 overflow-hidden rounded-b-lg">
              <GoogleMapsServer address={baustelle.address} className="w-full h-full" />
            </CardContent>
            <CardFooter className="pt-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
              >
                In Google Maps öffnen <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </CardFooter>
          </Card>
        )}

        {/* To-Do-Liste */}
        <div className="md:col-span-2 lg:col-span-1">
          <ProjectTodoList projectId={baustelleId} />
        </div>
      </div>

      {/* Bildergalerie */}
      {images.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <ImageIcon className="mr-2 h-6 w-6 text-primary" />
            Bildergalerie
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div key={img.id} className="aspect-square relative group overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.path || "/placeholder.svg"}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detaillierte Einträge */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Briefcase className="mr-2 h-6 w-6 text-primary" />
          Zugehörige Einträge ({entries.length})
        </h2>
        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <CardTitle className="text-md">{entry.activity}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(entry.entry_date).toLocaleDateString("de-DE")} | {entry.entry_time} -{" "}
                    {entry.end_time || "N/A"}({calculateDurationInHours(entry.entry_time, entry.end_time).toFixed(1)}{" "}
                    Std.)
                  </CardDescription>
                </CardHeader>
                {(entry.notes ||
                  (entry.materials_used &&
                    (JSON.parse(entry.materials_used as string) as SelectedMaterialItem[]).length > 0)) && (
                  <CardContent className="text-sm">
                    {entry.notes && <p className="text-muted-foreground mb-2">{entry.notes}</p>}
                    {entry.materials_used &&
                      (JSON.parse(entry.materials_used as string) as SelectedMaterialItem[]).length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold">Material:</h4>
                          <ul className="list-disc list-inside pl-1 text-xs">
                            {(JSON.parse(entry.materials_used as string) as SelectedMaterialItem[]).map((m, idx) => (
                              <li key={idx}>
                                {m.quantity} {m.unit || ""} {m.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Keine Einträge für diese Baustelle vorhanden.</p>
        )}
      </div>
    </div>
  )
}
