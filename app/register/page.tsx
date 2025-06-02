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
import { Loader2, Briefcase } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const { signUpWithEmail, user, loadingInitial } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loadingInitial && user) {
      router.push("/dashboard")
    }
  }, [user, loadingInitial, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.")
      return
    }
    setLoading(true)
    setError("")
    setSuccessMessage("")

    const { error: signUpError } = await signUpWithEmail(email, password, fullName)

    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccessMessage(
        "Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails zur Bestätigung und melden Sie sich dann an.",
      )
      // Optional: Automatische Weiterleitung nach kurzer Zeit oder manueller Klick
      // router.push("/login")
    }
    setLoading(false)
  }

  if (loadingInitial || (!loadingInitial && user)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Briefcase className="h-12 w-12 animate-pulse text-blue-600" />
      </div>
    )
  }

  if (successMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Briefcase className="mx-auto h-10 w-10 mb-2 text-blue-600" />
            <CardTitle className="text-2xl">Registrierung Erfolgreich</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="default">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/login")} className="w-full mt-4">
              Zum Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Briefcase className="mx-auto h-10 w-10 mb-2 text-blue-600" />
          <CardTitle className="text-2xl">Konto Erstellen</CardTitle>
          <CardDescription>Registrieren Sie sich für die Baustellendokumentation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Vollständiger Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                placeholder="Max Mustermann"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="name@beispiel.de"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                placeholder="Mind. 6 Zeichen"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                placeholder="Passwort wiederholen"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrieren
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p>Bereits ein Konto?</p>
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Hier anmelden
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
