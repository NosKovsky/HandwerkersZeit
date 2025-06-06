"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, AlertTriangle, TrendingDown, ArrowUpRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { getMaterials } from "@/app/materials/actions"
import type { Database } from "@/lib/supabase/database.types"

type Material = Database["public"]["Tables"]["materials"]["Row"] & {
  current_stock?: number
  min_stock?: number
  unit_price?: number
}

export function MaterialInventory() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddStock, setShowAddStock] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [stockToAdd, setStockToAdd] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadMaterials() {
      setIsLoading(true)
      try {
        const fetchedMaterials = await getMaterials()

        // Simulierte Bestandsdaten (in der echten App würden diese aus der DB kommen)
        const materialsWithStock = fetchedMaterials.map((material) => ({
          ...material,
          current_stock: Math.floor(Math.random() * 100),
          min_stock: 20,
          unit_price: Number.parseFloat((Math.random() * 50 + 5).toFixed(2)),
        }))

        setMaterials(materialsWithStock)
      } catch (error) {
        console.error("Fehler beim Laden der Materialien:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMaterials()
  }, [])

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lowStockMaterials = filteredMaterials.filter((material) => material.current_stock! < material.min_stock!)

  const openAddStockDialog = (material: Material) => {
    setSelectedMaterial(material)
    setStockToAdd(0)
    setShowAddStock(true)
  }

  const handleAddStock = async () => {
    if (!selectedMaterial || stockToAdd <= 0) return

    try {
      // Hier würde der API-Call zum Aktualisieren des Bestands kommen

      // Optimistisches UI-Update
      setMaterials(
        materials.map((material) =>
          material.id === selectedMaterial.id
            ? { ...material, current_stock: (material.current_stock || 0) + stockToAdd }
            : material,
        ),
      )

      toast.success(`${stockToAdd} ${selectedMaterial.unit || "Stück"} ${selectedMaterial.name} hinzugefügt`)
      setShowAddStock(false)
    } catch (error) {
      toast.error("Fehler beim Aktualisieren des Bestands")
    }
  }

  const getStockStatus = (material: Material) => {
    const stock = material.current_stock || 0
    const minStock = material.min_stock || 0

    if (stock <= 0) return "empty"
    if (stock < minStock) return "low"
    if (stock < minStock * 2) return "medium"
    return "good"
  }

  const getStockColor = (status: string) => {
    switch (status) {
      case "empty":
        return "bg-red-500"
      case "low":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "good":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStockPercentage = (material: Material) => {
    const stock = material.current_stock || 0
    const minStock = material.min_stock || 0

    // Wir betrachten 4x den Mindestbestand als "voll"
    const percentage = Math.min(Math.round((stock / (minStock * 4)) * 100), 100)
    return percentage
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Materialbestand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Material suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-4">Lade Materialien...</div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Keine Materialien gefunden</div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {lowStockMaterials.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                    Niedriger Bestand
                  </h3>

                  {lowStockMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-2 bg-orange-50 rounded-md mb-2"
                    >
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-xs text-gray-500">
                          Nur noch {material.current_stock} {material.unit || "Stück"} verfügbar
                        </p>
                      </div>
                      <Button size="sm" onClick={() => openAddStockDialog(material)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Auffüllen
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {filteredMaterials.map((material) => {
                const stockStatus = getStockStatus(material)
                const stockPercentage = getStockPercentage(material)

                return (
                  <div key={material.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{material.name}</h3>
                        <p className="text-sm text-gray-500">
                          {material.current_stock} {material.unit || "Stück"} verfügbar
                        </p>
                      </div>
                      <Badge
                        variant={stockStatus === "good" ? "default" : "outline"}
                        className={stockStatus !== "good" ? "text-orange-500 border-orange-200" : ""}
                      >
                        {stockStatus === "empty"
                          ? "Leer"
                          : stockStatus === "low"
                            ? "Kritisch"
                            : stockStatus === "medium"
                              ? "Niedrig"
                              : "OK"}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>Mindestbestand: {material.min_stock}</span>
                        <span>{material.min_stock! * 4}+</span>
                      </div>
                      <Progress value={stockPercentage} className="h-2" />
                    </div>

                    <div className="mt-3 flex justify-between">
                      <p className="text-xs text-gray-500">
                        Wert: ca. {((material.current_stock || 0) * (material.unit_price || 0)).toFixed(2)}€
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => openAddStockDialog(material)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Bestand
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm">
            <TrendingDown className="h-4 w-4 mr-2" />
            Bestandsbericht
          </Button>
          <Button size="sm">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Alle Materialien
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog zum Hinzufügen von Bestand */}
      <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bestand hinzufügen</DialogTitle>
          </DialogHeader>

          {selectedMaterial && (
            <div className="space-y-4 py-2">
              <div>
                <h3 className="font-medium">{selectedMaterial.name}</h3>
                <p className="text-sm text-gray-500">
                  Aktueller Bestand: {selectedMaterial.current_stock} {selectedMaterial.unit || "Stück"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock-amount">Menge hinzufügen</Label>
                <Input
                  id="stock-amount"
                  type="number"
                  min="1"
                  value={stockToAdd}
                  onChange={(e) => setStockToAdd(Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStock(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAddStock} disabled={stockToAdd <= 0}>
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
