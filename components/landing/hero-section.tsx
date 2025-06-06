"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, FileText, Camera, Receipt, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

export function HeroSection() {
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Intersection Observer für Scroll-Animationen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("feature-visible")
            observer.unobserve(entry.target) // Nur einmal animieren
          }
        })
      },
      {
        threshold: 0.2, // 20% des Elements muss sichtbar sein
        rootMargin: "0px 0px -100px 0px", // Etwas früher triggern
      },
    )

    // Alle Feature-Karten beobachten
    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* CSS für Animationen */}
      <style jsx global>{`
        .feature-card {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: all 0.6s ease-out;
        }
        
        .feature-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        /* Verzögerung für gestaffelte Animation */
        .feature-card:nth-child(1) { transition-delay: 0.1s; }
        .feature-card:nth-child(2) { transition-delay: 0.2s; }
        .feature-card:nth-child(3) { transition-delay: 0.3s; }
        .feature-card:nth-child(4) { transition-delay: 0.4s; }
        .feature-card:nth-child(5) { transition-delay: 0.5s; }
        .feature-card:nth-child(6) { transition-delay: 0.6s; }
      `}</style>

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-center items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">HandwerkersZeit</span>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">
            <span className="text-blue-600 block text-6xl md:text-8xl">HandwerkersZeit</span>
            Baustellendokumentation
            <span className="text-blue-600 block">leicht gemacht</span>
          </h1>

          {/* Login/Register Buttons hier unter dem Titel */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 max-w-md mx-auto">
            <Button variant="outline" size="lg" asChild className="flex-1">
              <Link href="/login">Anmelden</Link>
            </Button>
            <Button size="lg" asChild className="flex-1">
              <Link href="/register">Registrieren</Link>
            </Button>
          </div>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
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

        {/* Features Grid mit Animationen */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="feature-card" ref={(el) => (featureRefs.current[0] = el)}>
            <CardHeader>
              <Clock className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Zeiterfassung</CardTitle>
              <CardDescription>Erfassen Sie Arbeitszeiten und Tätigkeiten schnell und einfach</CardDescription>
            </CardHeader>
          </Card>

          <Card className="feature-card" ref={(el) => (featureRefs.current[1] = el)}>
            <CardHeader>
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Materialverwaltung</CardTitle>
              <CardDescription>Verwalten Sie verwendete Materialien und Mengen übersichtlich</CardDescription>
            </CardHeader>
          </Card>

          <Card className="feature-card" ref={(el) => (featureRefs.current[2] = el)}>
            <CardHeader>
              <Camera className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Foto-Dokumentation</CardTitle>
              <CardDescription>Fügen Sie Fotos zu Ihren Einträgen hinzu für bessere Dokumentation</CardDescription>
            </CardHeader>
          </Card>

          <Card className="feature-card" ref={(el) => (featureRefs.current[3] = el)}>
            <CardHeader>
              <Receipt className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Quittungen</CardTitle>
              <CardDescription>Digitalisieren Sie Quittungen und ordnen Sie sie Projekten zu</CardDescription>
            </CardHeader>
          </Card>

          <Card className="feature-card" ref={(el) => (featureRefs.current[4] = el)}>
            <CardHeader>
              <Users className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Projektmanagement</CardTitle>
              <CardDescription>Organisieren Sie Ihre Arbeit nach Baustellen und Projekten</CardDescription>
            </CardHeader>
          </Card>

          <Card className="feature-card" ref={(el) => (featureRefs.current[5] = el)}>
            <CardHeader>
              <Briefcase className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Berichte</CardTitle>
              <CardDescription>Erstellen Sie detaillierte Berichte für Ihre Kunden</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
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
