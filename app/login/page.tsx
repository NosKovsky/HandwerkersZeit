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
import { ThemeToggle } from "@/components/theme-toggle"
import { User, Lock, Mail, UserPlus, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  const { signIn, signUp } = useAuth()
  const router = useRouter()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name)
        if (error) throw error
        setError("Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail.")
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        router.push("/")
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Bauleiter</h1>
          <p className="mt-2 text-muted-foreground">Professionelles Dashboard für Bauleiter</p>
        </div>

        <Card className="dark:glass-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">{isSignUp ? "Registrierung" : "Anmeldung"}</CardTitle>
            <CardDescription className="text-center">
              {isSignUp ? "Erstellen Sie Ihr Bauleiter-Konto" : "Melden Sie sich in Ihrem Konto an"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-background/50 border-border"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  E-Mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  Passwort
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : isSignUp ? (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrieren
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Anmelden
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-sm">
              {isSignUp ? "Bereits ein Konto? Hier anmelden" : "Noch kein Konto? Hier registrieren"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
