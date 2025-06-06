"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  User,
  Phone,
  MapPin,
  CalendarIcon as CalendarIconLucide,
  DollarSign,
  FileText,
} from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { updateUserProfile } from "@/lib/client-actions" // Updated import
import type { Database } from "@/lib/database.types"

type UserProfile = Database["public"]["Tables"]["profiles"]["Row"] & {
  user_groups: {
    id: string
    name: string
    color: string
  } | null
}

type UserGroup = Database["public"]["Tables"]["user_groups"]["Row"]

interface UserEditDialogProps {
  user: UserProfile | null
  groups: UserGroup[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated: () => void
}

export function UserEditDialog({ user, groups, open, onOpenChange, onUserUpdated }: UserEditDialogProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    birth_date: null as Date | null,
    hire_date: null as Date | null,
    hourly_rate: "",
    is_active: true,
    notes: "",
    group_id: "",
    role: "user" as "admin" | "user",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        position: user.position || "",
        birth_date: user.birth_date ? new Date(user.birth_date) : null,
        hire_date: user.hire_date ? new Date(user.hire_date) : null,
        hourly_rate: user.hourly_rate?.toString() || "",
        is_active: user.is_active,
        notes: user.notes || "",
        group_id: user.group_id || "",
        role: user.role,
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const result = await updateUserProfile(user.id, {
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        address: formData.address || null,
        position: formData.position || null,
        birth_date: formData.birth_date?.toISOString().split("T")[0] || null,
        hire_date: formData.hire_date?.toISOString().split("T")[0] || null,
        hourly_rate: formData.hourly_rate ? Number.parseFloat(formData.hourly_rate) : null,
        is_active: formData.is_active,
        notes: formData.notes || null,
        group_id: formData.group_id || null,
        role: formData.role,
      })

      if (result.success) {
        toast({
          title: "Benutzer aktualisiert",
          description: "Die Benutzerdaten wurden erfolgreich gespeichert.",
        })
        onUserUpdated()
        onOpenChange(false)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: `Benutzer konnte nicht aktualisiert werden: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Benutzer bearbeiten
          </DialogTitle>
          <DialogDescription>
            Bearbeiten Sie die Benutzerdaten und Berechtigungen für {user.full_name || user.email}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grunddaten */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Grunddaten</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Vollständiger Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Max Mustermann"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" value={formData.email} disabled className="bg-muted" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center">
                  <Phone className="mr-1 h-4 w-4" />
                  Telefon
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+49 123 456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Dachdecker"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                Adresse
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Musterstraße 123, 12345 Musterstadt"
              />
            </div>
          </div>

          {/* Berufsdaten */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Berufsdaten</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gruppe</Label>
                <Select
                  value={formData.group_id}
                  onValueChange={(value) => setFormData({ ...formData, group_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gruppe auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: group.color }} />
                          {group.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rolle</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Benutzer</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <CalendarIconLucide className="mr-1 h-4 w-4" />
                  Geburtsdatum
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.birth_date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.birth_date
                        ? format(formData.birth_date, "dd.MM.yyyy", { locale: de })
                        : "Datum auswählen"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.birth_date || undefined}
                      onSelect={(date) => setFormData({ ...formData, birth_date: date || null })}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center">
                  <CalendarIconLucide className="mr-1 h-4 w-4" />
                  Einstellungsdatum
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.hire_date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.hire_date
                        ? format(formData.hire_date, "dd.MM.yyyy", { locale: de })
                        : "Datum auswählen"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.hire_date || undefined}
                      onSelect={(date) => setFormData({ ...formData, hire_date: date || null })}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourly_rate" className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  Stundenlohn (€)
                </Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  placeholder="25.00"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center">Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label className="text-sm">{formData.is_active ? "Aktiv" : "Inaktiv"}</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Notizen */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Notizen
            </h3>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Zusätzliche Informationen zum Benutzer..."
              rows={3}
            />
          </div>

          {/* Aktuelle Gruppe anzeigen */}
          {user.user_groups && (
            <div className="space-y-2">
              <Label>Aktuelle Gruppe</Label>
              <Badge
                variant="outline"
                className="flex items-center w-fit"
                style={{
                  backgroundColor: `${user.user_groups.color}20`,
                  borderColor: user.user_groups.color,
                  color: user.user_groups.color,
                }}
              >
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: user.user_groups.color }} />
                {user.user_groups.name}
              </Badge>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
