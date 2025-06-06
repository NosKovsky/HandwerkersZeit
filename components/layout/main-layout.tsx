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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <Hammer className="h-12 w-12 text-blue-600 animate-bounce" />
              <div className="absolute -top-1 -right-1">
                <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">HandwerksZeit</h2>
            <p className="text-muted-foreground">Wird geladen...</p>
            <div className="w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card/80 backdrop-blur-sm border-b px-4 py-3 md:px-6 md:py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className={cn("font-bold text-foreground", isMobile ? "text-lg ml-12" : "text-2xl")}>
              🔨 HandwerksZeit
            </h1>
            {!isMobile && (
              <div className="flex items-center space-x-2">
                <ModeToggle />
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}
