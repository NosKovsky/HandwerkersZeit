"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, HardHat, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { signInWithEmail, user, loading, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && profile) {
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    }
  }, [user, profile, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const { error: signInError } = await signInWithEmail(email, password)

    if (signInError) {
      setError(signInError.message)
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <HardHat className="h-16 w-16 mx-auto mb-6 text-orange-500 animate-bounce" />
            <div className="absolute -top-2 -right-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          </div>
          <p className="text-gray-300 text-xl">HandwerksZeit wird geladen...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <HardHat className="h-16 w-16 mx-auto mb-6 text-green-500 animate-pulse" />
            <Sparkles className="h-6 w-6 absolute -top-2 -right-2 text-yellow-500 animate-spin" />
          </div>
          <p className="text-gray-300 text-xl">Weiterleitung zum Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
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

      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <HardHat className="h-12 w-12 text-orange-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
              HandwerksZeit
            </span>
          </div>
          <p className="text-gray-300 text-lg">Digitale Baustellendokumentation für Profis</p>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/10 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <HardHat className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">Willkommen zurück</CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Melden Sie sich an, um Ihre Baustellendokumentation fortzusetzen
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-red-200">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-white text-lg font-medium">
                  E-Mail-Adresse
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="name@beispiel.de"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 h-12 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-white text-lg font-medium">
                  Passwort
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 h-12 text-lg"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 group h-14 text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Anmeldung läuft...
                  </>
                ) : (
                  <>
                    Anmelden
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center space-y-4 text-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="space-y-2">
              <p className="text-gray-300">Noch kein Konto?</p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 font-semibold text-orange-400 hover:text-orange-300 transition-colors group"
              >
                Hier kostenlos registrieren
                <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Features Preview */}
        <div className="mt-12 text-center max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>KI-Sprachsteuerung</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Mobile App-Installation</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Automatische Dokumentation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
