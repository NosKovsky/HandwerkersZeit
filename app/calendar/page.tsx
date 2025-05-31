"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import Layout from "@/components/layout"
import AuthGuard from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, MapPin } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Entry {
  id: string
  date: string
  time: string
  project: string
  activity: string
}

interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  entries: Entry[]
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  useEffect(() => {
    if (user) {
      fetchEntriesForMonth()
    }
  }, [user, currentDate])

  useEffect(() => {
    generateCalendarDays()
  }, [currentDate, entries])

  const fetchEntriesForMonth = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0]
      const lastDay = new Date(year, month + 2, 0).toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("entries")
        .select("id, date, time, project, activity")
        .eq("user_id", user!.id)
        .gte("date", firstDay)
        .lte("date", lastDay)
        .order("time")

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("Error fetching entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: CalendarDay[] = []
    const today = new Date().toISOString().split("T")[0]

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dateStr = date.toISOString().split("T")[0]
      const dayEntries = entries.filter((entry) => entry.date === dateStr)

      days.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: dateStr === today,
        entries: dayEntries,
      })
    }

    setCalendarDays(days)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const selectedDateEntries = selectedDate ? entries.filter((entry) => entry.date === selectedDate) : []

  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ]

  const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

  const monthStats = {
    totalEntries: entries.filter((entry) => entry.date.startsWith(currentDate.toISOString().slice(0, 7))).length,
    workDays: new Set(
      entries.filter((entry) => entry.date.startsWith(currentDate.toISOString().slice(0, 7))).map((e) => e.date),
    ).size,
    estimatedHours: entries.filter((entry) => entry.date.startsWith(currentDate.toISOString().slice(0, 7))).length * 8,
  }

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner size="lg" />
          </div>
        </Layout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kalender</h1>
            <p className="mt-2 text-gray-600">Übersicht Ihrer Arbeitseinträge nach Datum</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                        Heute
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {dayNames.map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((calendarDay, index) => {
                      const isSelected = selectedDate === calendarDay.date

                      return (
                        <div
                          key={index}
                          className={`p-2 h-24 border rounded cursor-pointer transition-all ${
                            !calendarDay.isCurrentMonth
                              ? "bg-gray-50 text-gray-400"
                              : isSelected
                                ? "bg-blue-100 border-blue-300 shadow-md"
                                : calendarDay.isToday
                                  ? "bg-yellow-50 border-yellow-300"
                                  : calendarDay.entries.length > 0
                                    ? "bg-green-50 border-green-200 hover:bg-green-100"
                                    : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedDate(calendarDay.date)}
                        >
                          <div className={`text-sm font-medium ${calendarDay.isToday ? "text-yellow-700" : ""}`}>
                            {calendarDay.day}
                          </div>
                          {calendarDay.entries.length > 0 && (
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-xs px-1 py-0.5">
                                {calendarDay.entries.length} Eintrag{calendarDay.entries.length !== 1 ? "e" : ""}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Date Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedDate ? `Einträge vom ${formatDate(selectedDate)}` : "Tag auswählen"}</CardTitle>
                  <CardDescription>
                    {selectedDate
                      ? `${selectedDateEntries.length} Eintrag${selectedDateEntries.length !== 1 ? "e" : ""} gefunden`
                      : "Klicken Sie auf einen Tag im Kalender"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDateEntries.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateEntries.map((entry) => (
                        <div key={entry.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center text-sm font-medium text-blue-600">
                              <Clock className="mr-1 h-4 w-4" />
                              {entry.time}
                            </div>
                          </div>
                          <div className="flex items-start mb-2">
                            <MapPin className="mr-1 h-4 w-4 text-gray-400 mt-0.5" />
                            <h4 className="font-medium text-sm">{entry.project}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{entry.activity}</p>
                        </div>
                      ))}
                    </div>
                  ) : selectedDate ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-gray-500 text-sm mt-2">Keine Einträge für diesen Tag</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-gray-500 text-sm mt-2">Wählen Sie einen Tag aus</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Monatsstatistik</CardTitle>
                  <CardDescription>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Einträge:</span>
                      <Badge variant="outline">{monthStats.totalEntries}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Arbeitstage:</span>
                      <Badge variant="outline">{monthStats.workDays}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Geschätzte Stunden:</span>
                      <Badge variant="outline">{monthStats.estimatedHours}h</Badge>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Durchschnitt/Tag:</span>
                        <span className="font-bold text-blue-600">
                          {monthStats.workDays > 0 ? (monthStats.estimatedHours / monthStats.workDays).toFixed(1) : 0}h
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  )
}
