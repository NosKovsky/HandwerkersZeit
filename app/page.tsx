"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Briefcase } from "lucide-react"

export default function HomePage() {
  const { user, loadingInitial } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loadingInitial) {
      if (user) {
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
    }
  }, [user, loadingInitial, router])

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-muted/40">
      <Briefcase className="h-16 w-16 animate-pulse text-blue-600" />
      <p className="mt-4 text-lg text-muted-foreground">Lade Anwendung...</p>
    </div>
  )
}
