"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { BaustelleForm } from "./baustelle-form"
import { MapPin, Calendar, User, Trash2, Edit, Plus } from "lucide-react"

interface Baustelle {
  id: string
  name: string
  address: string | null
  description: string | null
  status: string
  created_at: string
  profiles?: { full_name: string } | null
  customers?: {
    id: string
    name: string
    contact_person: string
    city: string
  } | null
}

interface BaustellenListAdminViewProps {
  baustellen: Baustelle[]
  onDelete: (id: string) => Promise<void>
  onUpdate: (id: string, data: any) => Promise<void>
  onCreate: (data: any) => Promise<void>
}

function BaustellenListAdminView({ baustellen = [], onDelete, onUpdate, onCreate }: BaustellenListAdminViewProps) {
  const [editingBaustelle, setEditingBaustelle] = useState<Baustelle | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [baustelleToDelete, setBaustelleToDelete] = useState<Baustelle | null>(null)

  const handleDelete = (baustelle: Baustelle) => {
    setBaustelleToDelete(baustelle)
  }

  const handleEdit = (baustelle: Baustelle) => {
    setEditingBaustelle(baustelle)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (data: any) => {
    if (editingBaustelle) {
      await onUpdate(editingBaustelle.id, data)
      setIsEditDialogOpen(false)
      setEditingBaustelle(null)
    }
  }

  const handleCreate = async (data: any) => {
    await onCreate(data)
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Baustellen verwalten</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Baustelle
        </Button>
      </div>

      {baustellen.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Baustellen gefunden</h3>
            <p className="text-muted-foreground mb-4">Erstellen Sie Ihre erste Baustelle, um zu beginnen.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Erste Baustelle erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {baustellen.map((baustelle) => (
            <Card key={baustelle.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{baustelle.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(baustelle)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(baustelle)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  <Badge variant="secondary">{baustelle.status}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {baustelle.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {baustelle.address}
                  </div>
                )}
                {baustelle.customers && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {baustelle.customers.name}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(baustelle.created_at).toLocaleDateString("de-DE")}
                </div>
                {baustelle.description && <p className="text-sm text-muted-foreground mt-2">{baustelle.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog für Baustelle erstellen/bearbeiten */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          setEditingBaustelle(null)
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBaustelle ? "Baustelle bearbeiten" : "Neue Baustelle"}
            </DialogTitle>
          </DialogHeader>
          <BaustelleForm
            baustelle={editingBaustelle ?? undefined}
            onSuccess={() => {
              setIsCreateDialogOpen(false)
              setIsEditDialogOpen(false)
              setEditingBaustelle(null)
            }}
            onSubmit={editingBaustelle ? handleUpdate : handleCreate}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog für Löschbestätigung */}
      <Dialog open={!!baustelleToDelete} onOpenChange={() => setBaustelleToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Baustelle löschen bestätigen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie die Baustelle "{baustelleToDelete?.name}" endgültig löschen möchten?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                if (baustelleToDelete) {
                  await onDelete(baustelleToDelete.id)
                  setBaustelleToDelete(null)
                }
              }}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BaustellenListAdminView
