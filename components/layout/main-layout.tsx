"use client"

import type React from "react"
import { ModeToggle } from "./mode-toggle" // Import ModeToggle component
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "./sidebar"
import { Loader2 } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/utils/cn" // Import cn utility function

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { loading } = useAuth()
  const isMobile = useMobile()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Lade HandwerkersZeit...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            <h1 className={cn("font-bold text-foreground", isMobile ? "text-lg ml-12" : "text-2xl")}>
              Baustellen Dokumentation
            </h1>
            {isMobile && (
              <div className="flex items-center space-x-2">
                <ModeToggle />
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
