"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, StopCircle, Clock } from "lucide-react"
import { formatDuration } from "@/utils/format-duration"

interface TouchTimeEntryProps {
  projectId: string
  projectName: string
  onComplete?: (data: {
    projectId: string
    startTime: string
    endTime: string
    duration: number
  }) => void
}

export function TouchTimeEntry({ projectId, projectName, onComplete }: TouchTimeEntryProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [pauseTime, setPauseTime] = useState<Date | null>(null)
  const [totalPauseDuration, setTotalPauseDuration] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        const now = new Date()
        const start = startTime as Date
        const pauseDuration = totalPauseDuration
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000) - pauseDuration
        setElapsedTime(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused, startTime, totalPauseDuration])

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
    setStartTime(new Date())
    setElapsedTime(0)
    setTotalPauseDuration(0)
  }

  const handlePause = () => {
    if (isPaused) {
      // Fortsetzen
      const pauseDuration = Math.floor((new Date().getTime() - (pauseTime as Date).getTime()) / 1000)
      setTotalPauseDuration(totalPauseDuration + pauseDuration)
      setIsPaused(false)
    } else {
      // Pausieren
      setPauseTime(new Date())
      setIsPaused(true)
    }
  }

  const handleStop = () => {
    if (!startTime) return

    const endTime = new Date()
    const formattedStartTime = startTime.toTimeString().slice(0, 5)
    const formattedEndTime = endTime.toTimeString().slice(0, 5)

    if (onComplete) {
      onComplete({
        projectId,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        duration: elapsedTime,
      })
    }

    setIsRunning(false)
    setIsPaused(false)
    setStartTime(null)
    setPauseTime(null)
    setElapsedTime(0)
    setTotalPauseDuration(0)
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Zeiterfassung
            </h3>
            <p className="text-sm text-muted-foreground">{projectName}</p>
          </div>
          {isRunning && (
            <Badge
              variant="outline"
              className={isPaused ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"}
            >
              {isPaused ? "Pausiert" : "Läuft"}
            </Badge>
          )}
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl font-bold tabular-nums mb-2">{formatDuration(elapsedTime)}</div>
          {startTime && (
            <div className="text-sm text-muted-foreground">Start: {startTime.toTimeString().slice(0, 5)} Uhr</div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="col-span-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-16 text-lg"
            >
              <Play className="h-6 w-6 mr-2" />
              Start
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePause}
                variant={isPaused ? "default" : "outline"}
                className={`h-16 ${
                  isPaused ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" : ""
                }`}
              >
                <Pause className="h-6 w-6 mr-2" />
                {isPaused ? "Fortsetzen" : "Pause"}
              </Button>
              <Button onClick={handleStop} variant="destructive" className="col-span-2 h-16">
                <StopCircle className="h-6 w-6 mr-2" />
                Beenden & Speichern
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
