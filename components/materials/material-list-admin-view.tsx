"use client"

import { Card } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { getMaterials, deleteMaterial } from "@/app/materials/actions"
import type { Database } from "@/lib/supabase/database.types"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Search, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { MaterialForm } from "./material-form"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

type Material = Database["public"]["Tables"]["materials"]["Row"]

export function MaterialListAdminView() {
  const { isAdmin } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)

  const { toast } = useToast()

  const fetchMaterials = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getMaterials()
      setMaterials(data)
    } catch (e) {
      setError("Fehler beim Laden der Materialien.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedMaterial(null)
    fetchMaterials()
  }

  const openEditForm = (material: Material) => {
    setSelectedMaterial(material)
    setIsFormOpen(true)
  }

  const openNewForm = () => {
    setSelectedMaterial(null)
    setIsFormOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!materialToDelete) return
    setIsLoading(true)
    const result = await deleteMaterial(materialToDelete.id)
    if (result.success) {
      toast({ title: "Erfolg", description: "Material gelöscht." })
      fetchMaterials()
    } else {
      toast({ title: "Fehler", description: result.error, variant: "destructive" })
    }
    setMaterialToDelete(null)
    setIsLoading(false)
  }

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isAdmin && !isLoading) {
    return (
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p className="font-bold">Zugriff Verweigert</p>
        <p>Sie haben keine Berechtigung, diesen Bereich zu verwalten.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Material Verwalten</h1>
        {isAdmin && (
          <Button onClick={openNewForm}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Neues Material
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Materialien durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Lade Materialien...</p>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Einheit</TableHead>
                <TableHead className="hidden md:table-cell">Beschreibung</TableHead>
                {isAdmin && <TableHead className="text-right">Aktionen</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{material.unit || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell truncate max-w-xs">
                      {material.description || "-"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => openEditForm(material)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Bearbeiten</span>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => setMaterialToDelete(material)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Löschen</span>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-10">
                    Keine Materialien gefunden.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <MaterialForm material={selectedMaterial} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!materialToDelete} onOpenChange={() => setMaterialToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Material Löschen Bestätigen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie das Material "{materialToDelete?.name}" endgültig löschen möchten?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
