"use client"

import { AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { getBaustellen, deleteBaustelle, type Baustelle } from "@/app/baustellen/actions"
import { BaustelleForm } from "./baustelle-form" // Corrected import path

interface BaustellenListAdminViewProps {
  googleMapsApiKey?: string
}

const BaustellenListAdminView = ({ googleMapsApiKey }: BaustellenListAdminViewProps) => {
  const [baustellen, setBaustellen] = useState<Baustelle[]>([])
  const [selectedBaustelle, setSelectedBaustelle] = useState<Baustelle | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [baustelleToDelete, setBaustelleToDelete] = useState<Baustelle | null>(null)

  useEffect(() => {
    fetchBaustellen()
  }, [])

  const fetchBaustellen = async () => {
    const baustellenData = await getBaustellen()
    setBaustellen(baustellenData)
  }

  const openEditForm = (baustelle: Baustelle) => {
    setSelectedBaustelle(baustelle)
    setIsEditDialogOpen(true)
  }

  const closeEditForm = () => {
    setSelectedBaustelle(null)
    setIsEditDialogOpen(false)
    fetchBaustellen()
  }

  const handleDeleteConfirm = async () => {
    if (baustelleToDelete) {
      await deleteBaustelle(baustelleToDelete.id)
      setBaustelleToDelete(null)
      fetchBaustellen()
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Baustelle hinzufügen</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Neue Baustelle</DialogTitle>
              <DialogDescription>Erstelle eine neue Baustelle.</DialogDescription>
            </DialogHeader>
            <BaustelleForm onSuccess={closeEditForm} googleMapsApiKey={googleMapsApiKey} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {baustellen.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <div>
                  <Button variant="secondary" size="sm" onClick={() => openEditForm(item)} className="mr-2">
                    Bearbeiten
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={() => setBaustelleToDelete(item)}>
                        Löschen
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Baustelle löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bist du sicher, dass du die Baustelle "{item.name}" löschen möchtest?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBaustelleToDelete(null)}>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Löschen</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardDescription className="text-xs">
                {item.address && <p>{item.address}</p>}
                <p>
                  Status:{" "}
                  <span
                    className={cn(
                      "font-medium",
                      item.status === "Aktiv" && "text-green-600",
                      item.status === "In Arbeit" && "text-yellow-600",
                      item.status === "Abgeschlossen" && "text-gray-500",
                    )}
                  >
                    {item.status || "Unbekannt"}
                  </span>
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Baustelle bearbeiten</DialogTitle>
            <DialogDescription>Bearbeite die Details der ausgewählten Baustelle.</DialogDescription>
          </DialogHeader>
          {selectedBaustelle && (
            <BaustelleForm
              baustelle={selectedBaustelle}
              onSuccess={closeEditForm}
              googleMapsApiKey={googleMapsApiKey}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BaustellenListAdminView
