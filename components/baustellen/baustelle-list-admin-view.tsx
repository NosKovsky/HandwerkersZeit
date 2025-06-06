"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, User, Trash2, Edit } from "lucide-react"
import { BaustelleForm } from "./baustelle-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Baustelle {
  id: string
  name: string
  address: string | null
  description: string | null
  status: string
  created_at: string
  profiles: { full_name: string } | null
  customers: {
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

function BaustellenListAdminView({ baustellen, onDelete, onUpdate, onCreate }: BaustellenListAdminViewProps) {
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Neue Baustelle</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neue Baustelle erstellen</DialogTitle>
            </DialogHeader>
            <BaustelleForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Baustelle bearbeiten</DialogTitle>
          </DialogHeader>
          {editingBaustelle && <BaustelleForm initialData={editingBaustelle} onSubmit={handleUpdate} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BaustellenListAdminView
