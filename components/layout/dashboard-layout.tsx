"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "./sidebar"
import { Loader2 } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
