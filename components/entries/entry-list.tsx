"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Clock, MapPin, Package } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"

interface Entry {
  id: string
  start_time: string
  end_time?: string
  task_description: string
  materials_used?: any[]
  project?: {
    name: string
    address: string
  }
  profiles?: {
    full_name: string
  }
  created_at: string
}

interface EntryListProps {
  entries: Entry[]
  onDelete?: (id: string) => void
  onEdit?: (entry: Entry) => void
}

export function EntryList({ entries, onDelete, onEdit }: EntryListProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Lade Einträge...</div>
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Noch keine Einträge vorhanden.</p>
        </CardContent>
      </Card>
    )
  }

  const calculateDuration = (start: string, end?: string) => {
    const startTime = new Date(start)
    const endTime = end ? new Date(end) : new Date()
    const diffMs = endTime.getTime() - startTime.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{entry.task_description}</CardTitle>
              <div className="flex items-center gap-2">
                {!entry.end_time && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Aktiv
                  </Badge>
                )}
                <Badge variant="outline">{calculateDuration(entry.start_time, entry.end_time)}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entry.project && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {entry.project.name} - {entry.project.address}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(entry.start_time).toLocaleString("de-DE")}
                  {entry.end_time && ` - ${new Date(entry.end_time).toLocaleString("de-DE")}`}
                </span>
              </div>

              {entry.materials_used && entry.materials_used.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4 mt-0.5" />
                  <div>
                    <span className="font-medium">Materialien:</span>
                    <ul className="mt-1 space-y-1">
                      {entry.materials_used.map((material, index) => (
                        <li key={index} className="ml-2">
                          • {material.name} ({material.quantity} {material.unit})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {entry.profiles && (
                <div className="text-sm text-muted-foreground">Erstellt von: {entry.profiles.full_name}</div>
              )}

              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(entry.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
              </div>

              <div className="flex gap-2 pt-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(entry)}>
                    <Edit
                      className="w-4 h-4 mr-1"
                      aria-label={`Eintrag "${entry.task_description.substring(0, 20)}..." bearbeiten`}
                    />
                    <span className="sr-only">Eintrag "{entry.task_description.substring(0, 20)}..." </span>Bearbeiten
                  </Button>
                )}
                {onDelete && (
                  <Button variant="outline" size="sm" onClick={() => onDelete(entry.id)}>
                    <Trash2
                      className="w-4 h-4 mr-1"
                      aria-label={`Eintrag "${entry.task_description.substring(0, 20)}..." löschen`}
                    />
                    <span className="sr-only">Eintrag "{entry.task_description.substring(0, 20)}..." </span>Löschen
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
