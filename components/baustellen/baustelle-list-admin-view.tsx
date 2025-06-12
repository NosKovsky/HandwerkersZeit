"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BaustelleForm } from "@/components/baustellen/baustelle-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

  const handleDelete = async (id: string) => {
    if (confirm("Sind Sie sicher, dass Sie diese Baustelle löschen möchten?")) {
      await onDelete(id)
    }
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
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(baustelle.id)}>
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Neue Baustelle</DialogTitle>
          </DialogHeader>
          <BaustelleForm onSuccess={() => setIsCreateDialogOpen(false)} onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Baustelle bearbeiten</DialogTitle>
          </DialogHeader>
          {editingBaustelle && (
            <BaustelleForm
              baustelle={editingBaustelle}
              onSuccess={() => setIsEditDialogOpen(false)}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BaustellenListAdminView
