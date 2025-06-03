"use client"

import type React from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Home,
  ListChecks,
  Package,
  MessageSquare,
  ImageIcon,
  Receipt,
  CalendarDays,
  SettingsIcon,
  LogOut,
  UserCircle,
  Construction,
  Briefcase,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/entries", label: "Einträge", icon: ListChecks },
  { href: "/projects", label: "Baustellen", icon: Construction },
  { href: "/materials", label: "Material", icon: Package },
  { href: "/tasks", label: "Aufgaben", icon: MessageSquare },
  { href: "/gallery", label: "Galerie", icon: ImageIcon },
  { href: "/receipts", label: "Quittungen", icon: Receipt },
  { href: "/calendar", label: "Kalender", icon: CalendarDays },
  { href: "/settings", label: "Einstellungen", icon: SettingsIcon },
]

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut, isAdmin, loading } = useAuth()

  const filteredNavItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Construction className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Navigation umschalten</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/dashboard"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Briefcase className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Baustellen Doku</span>
              </Link>
              {filteredNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin/users"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <UserCircle className="h-5 w-5" />
                  Benutzer (Admin)
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="relative ml-auto flex-1 md:grow-0">
          <h1 className="font-semibold text-lg hidden sm:block">Baustellen Doku</h1>
        </div>
        <ModeToggle />
        <Button variant="outline" size="icon" onClick={signOut} className="ml-auto md:ml-2">
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Abmelden</span>
        </Button>
      </header>

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/dashboard"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Briefcase className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">Baustellen Doku</span>
            </Link>
            {filteredNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            ))}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            {isAdmin && (
              <Link
                href="/admin/users"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                title="Benutzer (Admin)"
              >
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">Benutzer (Admin)</span>
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={signOut} title="Abmelden">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Abmelden</span>
            </Button>
          </nav>
        </aside>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">{children}</main>
      </div>
    </div>
  )
}
