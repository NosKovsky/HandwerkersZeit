"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Eye, Calendar, Building2 } from "lucide-react"
import { getGalleryImages, type GalleryImage } from "@/app/gallery/actions"
import { getProjects } from "@/app/projects/actions"
import type { Database } from "@/lib/supabase/database.types"

type Project = Database["public"]["Tables"]["projects"]["Row"]

interface GalleryViewProps {
  initialImages?: GalleryImage[]
}

export function GalleryView({ initialImages = [] }: GalleryViewProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    async function loadProjects() {
      try {
        const fetchedProjects = await getProjects()
        setProjects(fetchedProjects)
      } catch (error) {
        console.error("Error loading projects:", error)
      }
    }
    loadProjects()
  }, [])

  useEffect(() => {
    async function loadImages() {
      setIsLoading(true)
      try {
        const filters = selectedProject !== "all" ? { projectId: selectedProject } : undefined
        const fetchedImages = await getGalleryImages(filters)
        setImages(fetchedImages)
      } catch (error) {
        console.error("Error loading gallery images:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadImages()
  }, [selectedProject])

  const downloadImage = async (image: GalleryImage) => {
    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = image.fileName || `${image.type}-${image.id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("de-DE")
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Bildergalerie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Projekt filtern..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Projekte</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Bilder werden geladen...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Bilder gefunden.</p>
              {selectedProject !== "all" && (
                <p className="text-sm mt-2">
                  Versuchen Sie einen anderen Filter oder fügen Sie Bilder zu Ihren Einträgen hinzu.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <Card key={`${image.type}-${image.id}`} className="overflow-hidden group">
                  <div className="relative aspect-square">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.contextName}
                      className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                      loading="lazy"
                      onClick={() => setSelectedImage(image)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-2 left-2">
                      <Badge variant={image.type === "entry" ? "default" : "secondary"}>
                        {image.type === "entry" ? "Eintrag" : "Quittung"}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadImage(image)
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate" title={image.contextName}>
                      {image.contextName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(image.contextDate)}
                    </div>
                    {image.projectName && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate" title={image.projectName}>
                          {image.projectName}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bildvorschau Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url || "/placeholder.svg"}
              alt={selectedImage.contextName}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="icon" variant="secondary" onClick={() => downloadImage(selectedImage)}>
                <Download className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" onClick={() => setSelectedImage(null)}>
                ×
              </Button>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/60 text-white p-3 rounded-lg">
              <h3 className="font-medium">{selectedImage.contextName}</h3>
              <p className="text-sm opacity-90">{formatDate(selectedImage.contextDate)}</p>
              {selectedImage.projectName && <p className="text-sm opacity-90">{selectedImage.projectName}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
