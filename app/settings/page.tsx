"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import Layout from "@/components/layout"
import AuthGuard from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { User, Bell, Download, Shield, Database, Trash2 } from "lucide-react"
import { requestNotificationPermission } from "@/lib/firebase"

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [stats, setStats] = useState({
    entries: 0,
    receipts: 0,
    tasks: 0,
    images: 0,
  })

  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
    }
    checkNotificationPermission()
    fetchUserStats()
  }, [profile, user])

  const checkNotificationPermission = () => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted")
    }
  }

  const fetchUserStats = async () => {
    if (!user) return

    try {
      const [entriesRes, receiptsRes, tasksRes] = await Promise.all([
        supabase.from("entries").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("receipts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ])

      // Count images from entries and receipts
      const { data: entriesWithImages } = await supabase
        .from("entries")
        .select("images")
        .eq("user_id", user.id)
        .not("images", "is", null)

      const { data: receiptsWithImages } = await supabase
        .from("receipts")
        .select("image_url")
        .eq("user_id", user.id)
        .not("image_url", "is", null)

      const imageCount =
        (entriesWithImages?.reduce((acc, entry) => acc + (entry.images?.length || 0), 0) || 0) +
        (receiptsWithImages?.length || 0)

      setStats({
        entries: entriesRes.count || 0,
        receipts: receiptsRes.count || 0,
        tasks: tasksRes.count || 0,
        images: imageCount,
      })
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase.from("profiles").update({ name }).eq("id", user!.id)

      if (error) throw error

      setSuccess("Profil erfolgreich aktualisiert!")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationPermission = async () => {
    try {
      const token = await requestNotificationPermission()
      if (token) {
        setNotificationsEnabled(true)
        setSuccess("Benachrichtigungen aktiviert!")
      } else {
        setError("Benachrichtigungen wurden abgelehnt")
      }
    } catch (error) {
      setError("Fehler beim Aktivieren der Benachrichtigungen")
    }
  }

  const exportData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user!.id }),
      })

      if (!response.ok) throw new Error("Export fehlgeschlagen")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `bauleiter-export-${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccess("Daten erfolgreich exportiert!")
    } catch (error) {
      setError("Fehler beim Exportieren der Daten")
    } finally {
      setLoading(false)
    }
  }

  const deleteAllData = async () => {
    if (
      !confirm(
        "Sind Sie sicher, dass Sie alle Ihre Daten löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
      )
    ) {
      return
    }

    try {
      setLoading(true)

      // Delete in correct order due to foreign key constraints
      await supabase.from("task_comments").delete().eq("user_id", user!.id)
      await supabase.from("tasks").delete().eq("user_id", user!.id)
      await supabase.from("receipts").delete().eq("user_id", user!.id)
      await supabase.from("entries").delete().eq("user_id", user!.id)

      setSuccess("Alle Daten wurden erfolgreich gelöscht!")
      fetchUserStats()
    } catch (error) {
      setError("Fehler beim Löschen der Daten")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
            <p className="mt-2 text-gray-600">Verwalten Sie Ihr Profil und App-Einstellungen</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profil
              </CardTitle>
              <CardDescription>Aktualisieren Sie Ihre persönlichen Informationen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <Avatar name={profile?.name || profile?.email} size="lg" />
                <div>
                  <h3 className="font-medium">{profile?.name || "Unbekannt"}</h3>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                  <div className="flex items-center mt-1">
                    <Shield className="mr-1 h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {profile?.role === "admin" ? "Administrator" : "Benutzer"}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" type="email" value={user?.email || ""} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500 mt-1">E-Mail-Adresse kann nicht geändert werden</p>
                </div>

                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ihr vollständiger Name"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  {loading ? "Wird gespeichert..." : "Profil aktualisieren"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Ihre Daten
              </CardTitle>
              <CardDescription>Übersicht über Ihre gespeicherten Daten</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{stats.entries}</div>
                  <div className="text-sm text-blue-600">Einträge</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">{stats.receipts}</div>
                  <div className="text-sm text-green-600">Quittungen</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">{stats.tasks}</div>
                  <div className="text-sm text-purple-600">Aufgaben</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-900">{stats.images}</div>
                  <div className="text-sm text-yellow-600">Bilder</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Benachrichtigungen
              </CardTitle>
              <CardDescription>Verwalten Sie Ihre Benachrichtigungseinstellungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Push-Benachrichtigungen</h4>
                  <p className="text-sm text-gray-500">Erhalten Sie Benachrichtigungen für neue Aufgaben und Updates</p>
                </div>
                <Button
                  variant={notificationsEnabled ? "default" : "outline"}
                  onClick={handleNotificationPermission}
                  disabled={notificationsEnabled}
                >
                  {notificationsEnabled ? "Aktiviert" : "Aktivieren"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5" />
                Datenverwaltung
              </CardTitle>
              <CardDescription>Exportieren oder löschen Sie Ihre Daten</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Daten exportieren</h4>
                  <p className="text-sm text-gray-500">Laden Sie alle Ihre Daten als ZIP-Archiv herunter</p>
                </div>
                <Button onClick={exportData} disabled={loading}>
                  <Download className="mr-2 h-4 w-4" />
                  {loading ? "Wird exportiert..." : "Exportieren"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">Alle Daten löschen</h4>
                  <p className="text-sm text-red-600">
                    Löscht unwiderruflich alle Ihre Einträge, Quittungen und Aufgaben
                  </p>
                </div>
                <Button variant="destructive" onClick={deleteAllData} disabled={loading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  )
}
