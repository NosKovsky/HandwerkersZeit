"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, FileText, Camera, Receipt, Users, Loader2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!loading && user && !redirecting) {
      setRedirecting(true)
      router.push("/dashboard")
    }
  }, [user, loading, router, redirecting])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Lade HandwerkersZeit...</p>
        </div>
      </div>
    )
  }

  if (user && redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Weiterleitung zum Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">HandwerkersZeit</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Anmelden</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrieren</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Baustellendokumentation
            <span className="text-blue-600 block">leicht gemacht</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Dokumentieren Sie Ihre Arbeitszeit, Materialien und Quittungen digital. Einfach, schnell und immer
            verfügbar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Kostenlos starten</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Bereits registriert?</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Clock className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Zeiterfassung</CardTitle>
              <CardDescription>Erfassen Sie Arbeitszeiten und Tätigkeiten schnell und einfach</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Materialverwaltung</CardTitle>
              <CardDescription>Verwalten Sie verwendete Materialien und Mengen übersichtlich</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Camera className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Foto-Dokumentation</CardTitle>
              <CardDescription>Fügen Sie Fotos zu Ihren Einträgen hinzu für bessere Dokumentation</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Receipt className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Quittungen</CardTitle>
              <CardDescription>Digitalisieren Sie Quittungen und ordnen Sie sie Projekten zu</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Projektmanagement</CardTitle>
              <CardDescription>Organisieren Sie Ihre Arbeit nach Baustellen und Projekten</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Briefcase className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Berichte</CardTitle>
              <CardDescription>Erstellen Sie detaillierte Berichte für Ihre Kunden</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Bereit anzufangen?</CardTitle>
              <CardDescription>Starten Sie noch heute mit der digitalen Baustellendokumentation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/register">Jetzt kostenlos registrieren</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
