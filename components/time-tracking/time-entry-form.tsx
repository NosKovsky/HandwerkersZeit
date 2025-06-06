"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SimpleVoiceNotes } from "@/components/zeiterfassung/simple-voice-notes"

interface TimeEntryFormProps {
  onSubmit: (data: any) => void
  initialData?: any
}

export function TimeEntryForm({ onSubmit, initialData }: TimeEntryFormProps) {
  const [startTime, setStartTime] = useState(initialData?.startTime || "")
  const [endTime, setEndTime] = useState(initialData?.endTime || "")
  const [task, setTask] = useState(initialData?.task || "")
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [materialsUsed, setMaterialsUsed] = useState<any[]>(initialData?.materialsUsed || [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      startTime,
      endTime,
      task,
      notes,
      materialsUsed,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zeiteintrag erfassen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Startzeit</Label>
              <Input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">Endzeit</Label>
              <Input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="task">Aufgabe</Label>
            <Input
              type="text"
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Beschreibung der Tätigkeit"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Zusätzliche Notizen..."
              rows={3}
            />
          </div>

          {/* Voice Notes für Zeiterfassung */}
          <SimpleVoiceNotes onNotesUpdate={(newNotes) => setNotes(newNotes)} currentNotes={notes} />

          <Button type="submit" className="w-full">
            Eintrag speichern
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default TimeEntryForm
