"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "./sidebar"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Nach 3 Sekunden Loading automatisch beenden
    const timeout = setTimeout(() => {
      if (loading && !user) {
        router.push("/login")
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }, [loading, user, router])

  // Maximale Loading-Zeit: 3 Sekunden
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Lade Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Falls das länger dauert, bitte neu anmelden</p>
        </div>
      </div>
    )
  }

  // Kein User = sofort zum Login
  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
