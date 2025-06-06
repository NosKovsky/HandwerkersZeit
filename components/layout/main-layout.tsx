"use client"

import type React from "react"
import { ModeToggle } from "./mode-toggle"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "./sidebar"
import { Loader2, Hammer } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/utils/cn"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { loading } = useAuth()
  const isMobile = useMobile()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Hammer className="h-8 w-8 text-primary animate-bounce" />
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">HandwerksZeit wird geladen...</h2>
            <p className="text-muted-foreground">Einen Moment bitte</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b px-4 py-3 md:px-6 md:py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className={cn("font-bold text-foreground", isMobile ? "text-lg ml-12" : "text-2xl")}>
              🔨 HandwerksZeit
            </h1>
            {isMobile && (
              <div className="flex items-center space-x-2">
                <ModeToggle />
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  )
}
