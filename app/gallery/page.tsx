"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import Layout from "@/components/layout"
import AuthGuard from "@/components/auth-guard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Images, Calendar, FolderOpen, Search, Download, X } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface ImageData {
  id: string
  url: string
  source: "entry" | "receipt"
  project?: string
  date: string
  description?: string
  company?: string
}

export default function GalleryPage() {
  const { user } = useAuth()
  const [images, setImages] = useState<ImageData[]>([])
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [selectedSource, setSelectedSource] = useState<string>("all")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (user) {
      fetchImages()
    }
  }, [user])

  useEffect(() => {
    filterImages()
  }, [images, selectedProject, selectedSource, searchTerm])

  const fetchImages = async () => {
    try {
      const allImages: ImageData[] = []
      const projectSet = new Set<string>()

      // Fetch images from entries
      const { data: entries, error: entriesError } = await supabase
        .from("entries")
        .select("id, images, project, date, activity")
        .eq("user_id", user!.id)
        .not("images", "is", null)

      if (entriesError) throw entriesError

      entries?.forEach((entry) => {
        if (entry.images) {
          entry.images.forEach((imagePath: string) => {
            allImages.push({
              id: `entry-${entry.id}-${imagePath}`,
              url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${imagePath}`,
              source: "entry",
              project: entry.project,
              date: entry.date,
              description: entry.activity,
            })
          })
          projectSet.add(entry.project)
        }
      })

      // Fetch images from receipts
      const { data: receipts, error: receiptsError } = await supabase
        .from("receipts")
        .select("id, image_url, date, description, company")
        .eq("user_id", user!.id)
        .not("image_url", "is", null)

      if (receiptsError) throw receiptsError

      receipts?.forEach((receipt) => {
        if (receipt.image_url) {
          allImages.push({
            id: `receipt-${receipt.id}`,
            url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${receipt.image_url}`,
            source: "receipt",
            date: receipt.date,
            description: receipt.description,
            company: receipt.company,
          })
        }
      })

      // Sort by date (newest first)
      allImages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setImages(allImages)
      setProjects(Array.from(projectSet).sort())
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterImages = () => {
    let filtered = images

    // Project filter
    if (selectedProject !== "all") {
      filtered = filtered.filter((img) => img.project === selectedProject)
    }

    // Source filter
    if (selectedSource !== "all") {
      filtered = filtered.filter((img) => img.source === selectedSource)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (img) =>
          img.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.project?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredImages(filtered)
  }

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner size="lg" />
          </div>
        </Layout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Galerie</h1>
              <p className="mt-2 text-gray-600">Alle Bilder aus Einträgen und Quittungen</p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Images className="mr-2 h-5 w-5" />
                Filter & Suche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Suche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Beschreibung, Firma, Projekt..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Projekt</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle Projekte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Projekte</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quelle</label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle Quellen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Quellen</SelectItem>
                      <SelectItem value="entry">Eintrag</SelectItem>
                      <SelectItem value="receipt">Quittung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="text-sm">
                    <span className="font-medium">Gefunden: </span>
                    <span className="text-lg font-bold text-blue-600">{filteredImages.length}</span>
                    <div className="text-xs text-gray-500">von {images.length} Bildern</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Grid */}
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <div
                    className="aspect-square overflow-hidden rounded-t-lg"
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.description || "Bild"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={image.source === "entry" ? "default" : "secondary"} className="text-xs">
                        {image.source === "entry" ? (
                          <>
                            <FolderOpen className="mr-1 h-3 w-3" />
                            Eintrag
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-1 h-3 w-3" />
                            Quittung
                          </>
                        )}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => downloadImage(image.url, `${image.source}-${formatDate(image.date)}.jpg`)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 mb-1">{formatDate(image.date)}</div>

                    {image.project && (
                      <div className="text-xs font-medium text-gray-700 truncate mb-1">{image.project}</div>
                    )}

                    {image.company && (
                      <div className="text-xs font-medium text-gray-700 truncate mb-1">{image.company}</div>
                    )}

                    {image.description && <div className="text-xs text-gray-600 truncate">{image.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Images className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Bilder gefunden</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {images.length === 0
                    ? "Fügen Sie Bilder zu Ihren Einträgen oder Quittungen hinzu."
                    : "Versuchen Sie andere Suchkriterien."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Image Modal */}
          {selectedImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative max-w-4xl max-h-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-75"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Vergrößertes Bild"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  )
}
