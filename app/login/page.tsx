"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
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

  const { signIn, signUp, user } = useAuth()
  const router = useRouter()

  // Wenn bereits eingeloggt, weiterleiten
  useEffect(() => {
    setMounted(true)
    if (user) {
      router.push("/dashboard")
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name)
        if (error) throw error
        setError("Registrierung erfolgreich! Bitte E-Mail bestätigen.")
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        router.push("/dashboard") // ✅ Weiterleitung nach erfolgreichem Login
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {isSignUp ? "Registrieren" : "Anmelden"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Erstelle ein neues Konto für HandwerkersZeit."
              : "Melde dich mit deinem Konto an, um fortzufahren."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isSignUp && (
              <div>
                <Label htmlFor="name">Name</Label>
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Passwort</Label>
              <div className="flex items-center gap-2">
                <Lock size={16} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Wird verarbeitet..." : isSignUp ? "Registrieren" : "Anmelden"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full"
            >
              {isSignUp ? (
                <>
                  <LogIn size={16} className="mr-1" /> Bereits registriert? Jetzt anmelden
                </>
              ) : (
                <>
                  <UserPlus size={16} className="mr-1" /> Noch kein Konto? Jetzt registrieren
                </>
              )}
            </Button>
            <div className="mt-4 w-full flex justify-center">
              <ThemeToggle />
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
