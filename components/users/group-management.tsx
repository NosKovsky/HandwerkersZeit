"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Shield, Plus, Settings } from "lucide-react"
import { getUserGroups, getAllPermissions, createUserGroup, updateGroupPermissions } from "./actions"
import type { Database } from "@/lib/database.types"

type UserGroup = Database["public"]["Tables"]["user_groups"]["Row"] & {
  permissions: Array<{
    id: string
    name: string
    description: string | null
    category: string
  }>
}

type Permission = Database["public"]["Tables"]["permissions"]["Row"]

export function GroupManagement() {
  const [groups, setGroups] = useState<UserGroup[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  })

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [groupsResult, permissionsResult] = await Promise.all([getUserGroups(), getAllPermissions()])

      if (groupsResult.groups) {
        setGroups(groupsResult.groups)
      }
      if (permissionsResult.permissions) {
        setPermissions(permissionsResult.permissions)
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    try {
      const result = await createUserGroup({
        name: newGroup.name,
        description: newGroup.description,
        color: newGroup.color,
        sort_order: groups.length + 1,
      })

      if (result.success) {
        toast({
          title: "Gruppe erstellt",
          description: `Die Gruppe "${newGroup.name}" wurde erfolgreich erstellt.`,
        })
        setNewGroup({ name: "", description: "", color: "#3B82F6" })
        setIsCreateDialogOpen(false)
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: `Gruppe konnte nicht erstellt werden: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        variant: "destructive",
      })
    }
  }

  const handleEditPermissions = (group: UserGroup) => {
    setSelectedGroup(group)
    setSelectedPermissions(group.permissions.map((p) => p.id))
    setIsPermissionDialogOpen(true)
  }

  const handleSavePermissions = async () => {
    if (!selectedGroup) return

    try {
      const result = await updateGroupPermissions(selectedGroup.id, selectedPermissions)

      if (result.success) {
        toast({
          title: "Berechtigungen aktualisiert",
          description: `Die Berechtigungen für "${selectedGroup.name}" wurden erfolgreich aktualisiert.`,
        })
        setIsPermissionDialogOpen(false)
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: `Berechtigungen konnten nicht aktualisiert werden: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        variant: "destructive",
      })
    }
  }

  const groupPermissionsByCategory = (permissions: Permission[]) => {
    return permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.category]) {
          acc[permission.category] = []
        }
        acc[permission.category].push(permission)
        return acc
      },
      {} as Record<string, Permission[]>,
    )
  }

  const categoryNames: Record<string, string> = {
    entries: "Arbeitszeiten",
    projects: "Baustellen",
    customers: "Kunden",
    users: "Benutzer",
    reports: "Berichte",
    materials: "Materialien",
  }

  if (isLoading) {
    return <div>Lade Gruppendaten...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gruppenverwaltung</h2>
          <p className="text-muted-foreground">Verwalten Sie Benutzergruppen und deren Berechtigungen.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neue Gruppe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Gruppe erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Benutzergruppe mit spezifischen Berechtigungen.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="z.B. Vorarbeiter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Beschreibung der Gruppe..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Farbe</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={newGroup.color}
                    onChange={(e) => setNewGroup({ ...newGroup, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={newGroup.color}
                    onChange={(e) => setNewGroup({ ...newGroup, color: e.target.value })}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateGroup} disabled={!newGroup.name}>
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: group.color }} />
                  {group.name}
                </div>
                <Button size="sm" variant="outline" onClick={() => handleEditPermissions(group)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="mr-1 h-4 w-4" />
                  {group.permissions.length} Berechtigungen
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.permissions.slice(0, 3).map((permission) => (
                    <Badge key={permission.id} variant="secondary" className="text-xs">
                      {categoryNames[permission.category] || permission.category}
                    </Badge>
                  ))}
                  {group.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.permissions.length - 3} weitere
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Berechtigungen bearbeiten Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Berechtigungen für {selectedGroup?.name}
            </DialogTitle>
            <DialogDescription>Wählen Sie die Berechtigungen aus, die diese Gruppe haben soll.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-6">
              {Object.entries(groupPermissionsByCategory(permissions)).map(([category, categoryPermissions]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {categoryNames[category] || category}
                  </h4>
                  <div className="space-y-2">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPermissions([...selectedPermissions, permission.id])
                            } else {
                              setSelectedPermissions(selectedPermissions.filter((id) => id !== permission.id))
                            }
                          }}
                        />
                        <Label htmlFor={permission.id} className="text-sm">
                          <div>
                            <div className="font-medium">{permission.description}</div>
                            <div className="text-xs text-muted-foreground">{permission.name}</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSavePermissions}>Berechtigungen speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
