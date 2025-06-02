"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Package } from "lucide-react"
import { getMaterials } from "@/app/materials/actions"
import type { Database } from "@/lib/supabase/database.types"

type Material = Database["public"]["Tables"]["materials"]["Row"]

export interface SelectedMaterialItem {
  material_id: string
  material_name: string
  quantity: number
  unit: string
}

interface MaterialSelectorProps {
  selectedMaterials: SelectedMaterialItem[]
  onChange: (materials: SelectedMaterialItem[]) => void
  disabled?: boolean
}

export function MaterialSelector({ selectedMaterials, onChange, disabled = false }: MaterialSelectorProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)

  useEffect(() => {
    async function loadMaterials() {
      setIsLoading(true)
      try {
        const fetchedMaterials = await getMaterials()
        setMaterials(fetchedMaterials)
      } catch (error) {
        console.error("Error loading materials:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadMaterials()
  }, [])

  const addMaterial = () => {
    if (!selectedMaterialId || quantity <= 0) return

    const material = materials.find((m) => m.id === selectedMaterialId)
    if (!material) return

    // Prüfen ob Material bereits ausgewählt
    const existingIndex = selectedMaterials.findIndex((m) => m.material_id === selectedMaterialId)

    if (existingIndex >= 0) {
      // Menge aktualisieren
      const updated = [...selectedMaterials]
      updated[existingIndex].quantity += quantity
      onChange(updated)
    } else {
      // Neues Material hinzufügen
      const newMaterial: SelectedMaterialItem = {
        material_id: material.id,
        material_name: material.name,
        quantity: quantity,
        unit: material.unit || "Stück",
      }
      onChange([...selectedMaterials, newMaterial])
    }

    // Form zurücksetzen
    setSelectedMaterialId("")
    setQuantity(1)
  }

  const removeMaterial = (materialId: string) => {
    onChange(selectedMaterials.filter((m) => m.material_id !== materialId))
  }

  const updateQuantity = (materialId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeMaterial(materialId)
      return
    }

    const updated = selectedMaterials.map((m) => (m.material_id === materialId ? { ...m, quantity: newQuantity } : m))
    onChange(updated)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          Verwendete Materialien
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Material hinzufügen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <Label htmlFor="material-select" className="sr-only">
              Material auswählen
            </Label>
            <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId} disabled={disabled || isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Material auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name} ({material.unit || "Stück"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(Number.parseFloat(e.target.value) || 1)}
              placeholder="Menge"
              disabled={disabled}
              className="w-20"
            />
            <Button
              type="button"
              onClick={addMaterial}
              disabled={disabled || !selectedMaterialId || quantity <= 0}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Ausgewählte Materialien */}
        {selectedMaterials.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ausgewählte Materialien:</Label>
            <div className="space-y-2">
              {selectedMaterials.map((material) => (
                <div key={material.material_id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{material.material_name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {material.quantity} {material.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={material.quantity}
                      onChange={(e) => updateQuantity(material.material_id, Number.parseFloat(e.target.value) || 0)}
                      disabled={disabled}
                      className="w-20 h-8"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeMaterial(material.material_id)}
                      disabled={disabled}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedMaterials.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Keine Materialien ausgewählt</p>
        )}
      </CardContent>
    </Card>
  )
}
