"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar } from "@/components/ui/avatar"
import {
  Home,
  FileText,
  Receipt,
  Calendar,
  CheckSquare,
  Images,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Einträge", href: "/entries", icon: FileText },
  { name: "Quittungen", href: "/receipts", icon: Receipt },
  { name: "Kalender", href: "/calendar", icon: Calendar },
  { name: "Aufgaben", href: "/tasks", icon: CheckSquare },
  { name: "Galerie", href: "/gallery", icon: Images },
  { name: "Projekte", href: "/projects", icon: FolderOpen },
  { name: "Einstellungen", href: "/settings", icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { signOut, profile } = useAuth()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background dark:gradient-bg">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-card dark:glass-card">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-card-foreground">Bauleiter</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all ${
                    isActive
                      ? "nav-item-active text-primary bg-primary/10"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {item.name}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
                </Link>
              )
            })}
          </nav>
          <div className="p-4">
            <Button variant="outline" onClick={signOut} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card dark:glass-card border-r border-border">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-card-foreground">Bauleiter Dashboard</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all ${
                    isActive
                      ? "nav-item-active text-primary bg-primary/10"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {item.name}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50">
              <Avatar name={profile?.name || profile?.email} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.name || "Benutzer"}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </div>
              {profile?.role === "admin" && (
                <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                  Admin
                </span>
              )}
            </div>
            <Button variant="outline" onClick={signOut} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-border bg-background/80 backdrop-blur-sm px-4 shadow-sm lg:px-6">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
              <div className="hidden md:block">
                <Avatar name={profile?.name || profile?.email} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 animate-fade-in">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
