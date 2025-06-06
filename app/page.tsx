"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  FileText,
  Camera,
  Receipt,
  Users,
  Loader2,
  HardHat,
  Building,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Smartphone,
  Play,
  Sparkles,
  TrendingUp,
  Award,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!loading && user && !redirecting) {
      setRedirecting(true)
      router.push("/dashboard")
    }
  }, [user, loading, router, redirecting])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <HardHat className="h-12 w-12 mx-auto mb-4 text-orange-500 animate-bounce" />
            <div className="absolute -top-1 -right-1">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            </div>
          </div>
          <p className="text-gray-300">HandwerksZeit wird geladen...</p>
        </div>
      </div>
    )
  }

  if (user && redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 animate-pulse" />
          <p className="text-gray-300">Weiterleitung zum Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Mouse follower */}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-orange-500/5 to-blue-500/5 rounded-full blur-3xl transition-all duration-1000 ease-out pointer-events-none"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <HardHat className="h-8 w-8 text-orange-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
              HandwerksZeit
            </span>
            <Badge variant="secondary" className="hidden sm:inline-flex bg-white/10 text-white border-white/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Für Handwerker
            </Badge>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              asChild
              className="text-white hover:bg-white/10 border border-white/30 hover:border-white/50"
            >
              <Link href="/login">Anmelden</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-orange-500/25"
            >
              <Link href="/register">Registrieren</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 relative">
        <div className="text-center mb-20">
          <div className="mb-8">
            <Badge variant="outline" className="mb-6 bg-white/5 text-white border-white/20 backdrop-blur-sm">
              <Zap className="h-3 w-3 mr-1 text-yellow-500" />
              Revolutionäre Baustellendokumentation
            </Badge>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-tight">
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent block mb-4 animate-pulse">
              HandwerksZeit
            </span>
            <span className="text-3xl md:text-5xl text-gray-300 font-light block mb-2">Intelligente</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Sprachsteuerung
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
            Entwickelt von <strong className="text-orange-500">echten Dachdeckern</strong> für alle Handwerker. Sprechen
            Sie einfach - die KI erstellt automatisch Einträge, Kunden, Baustellen und Aufgaben!
            <strong className="text-blue-400"> Revolutionär einfach!</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 group text-lg px-8 py-4"
            >
              <Link href="/register">
                <Play className="mr-2 h-5 w-5" />
                Jetzt kostenlos starten
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="text-white hover:bg-white/10 border border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-300 text-lg px-8 py-4"
            >
              <Link href="/login">Bereits registriert?</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              100% Kostenlos
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              DSGVO-konform
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-purple-500" />
              Als App installierbar
            </div>
          </div>
        </div>

        {/* Features Grid mit realistischen Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: MessageSquare,
              title: "KI-Sprachsteuerung",
              description: "Sprechen Sie alles - Kunde, Baustelle, Materialien. Die KI macht den Rest automatisch!",
              color: "from-purple-500 to-pink-500",
              bgColor: "bg-purple-500/10",
            },
            {
              icon: Clock,
              title: "Intelligente Zeiterfassung",
              description: "Automatische Erkennung von Arbeitszeiten aus Spracheingaben.",
              color: "from-blue-500 to-cyan-500",
              bgColor: "bg-blue-500/10",
            },
            {
              icon: FileText,
              title: "Auto-Materialverwaltung",
              description: "KI erkennt verwendete und benötigte Materialien automatisch.",
              color: "from-green-500 to-emerald-500",
              bgColor: "bg-green-500/10",
            },
            {
              icon: Camera,
              title: "Foto-Dokumentation",
              description: "Baufortschritt mit Fotos dokumentieren - direkt vom Smartphone.",
              color: "from-orange-500 to-yellow-500",
              bgColor: "bg-orange-500/10",
            },
            {
              icon: Building,
              title: "Auto-Baustellen-Erstellung",
              description: "Neue Kunden und Baustellen werden automatisch aus Sprache erstellt.",
              color: "from-red-500 to-pink-500",
              bgColor: "bg-red-500/10",
            },
            {
              icon: Receipt,
              title: "Aufgaben-Management",
              description: "Benötigte Materialien werden automatisch als Aufgaben erstellt.",
              color: "from-indigo-500 to-purple-500",
              bgColor: "bg-indigo-500/10",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="group hover:scale-105 transition-all duration-500 border-0 bg-white/5 backdrop-blur-xl hover:bg-white/10 shadow-2xl hover:shadow-3xl"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <CardContent className="p-8 text-center">
                <div
                  className={`w-20 h-20 ${feature.bgColor} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm`}
                >
                  <feature.icon className={`h-10 w-10 text-white`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section - realistische Zahlen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {[
            { icon: Users, value: "150+", label: "Aktive Nutzer", color: "text-blue-400" },
            { icon: Building, value: "85+", label: "Betriebe", color: "text-orange-400" },
            { icon: TrendingUp, value: "96%", label: "Zufriedenheit", color: "text-green-400" },
            { icon: Award, value: "12K+", label: "Erfasste Stunden", color: "text-purple-400" },
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-4`} />
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="text-center mb-20">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-orange-500/10 to-blue-500/10 border-0 backdrop-blur-xl">
            <CardContent className="p-10">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl italic text-slate-800 mb-6 leading-relaxed font-medium">
                "HandwerksZeit hat unsere Baustellendokumentation revolutioniert! Einfach sprechen und alles wird
                automatisch erfasst - spart uns täglich Stunden!"
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center">
                  <HardHat className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-lg">Thomas Müller</p>
                  <p className="text-slate-600">Dachdeckermeister, Berlin</p>
                  <p className="text-orange-600 text-sm font-medium">Nutzt HandwerksZeit seit 6 Monaten</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-orange-500 to-blue-500 border-0 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-white mb-4">Bereit für KI-gestützte Zeiterfassung?</h2>
              <p className="text-orange-100 text-xl mb-8 leading-relaxed">
                Schließen Sie sich über 150 Handwerkern an und erleben Sie die Zukunft der Sprachsteuerung
              </p>
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-12 py-4 text-xl shadow-2xl hover:shadow-white/50 transition-all duration-300 group"
                asChild
              >
                <Link href="/register">
                  <Sparkles className="mr-3 h-6 w-6" />
                  Jetzt revolutionieren
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <p className="text-orange-100 text-sm mt-6">
                ✨ Keine Kreditkarte erforderlich ✨ Sofort einsatzbereit ✨ Jederzeit kündbar
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <HardHat className="h-6 w-6 text-orange-500" />
              <span className="font-bold text-white">HandwerksZeit</span>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                Made by Handwerker
              </Badge>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/datenschutz" className="hover:text-orange-500 transition-colors">
                Datenschutz
              </Link>
              <Link href="/impressum" className="hover:text-orange-500 transition-colors">
                Impressum
              </Link>
              <Link href="/kontakt" className="hover:text-orange-500 transition-colors">
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
