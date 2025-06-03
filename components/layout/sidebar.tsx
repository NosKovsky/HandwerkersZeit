"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  ClipboardList,
  FolderKanban,
  Clock,
  CheckSquare,
  Package,
  Receipt,
  Images,
  Settings,
  LogOut,
  Users,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()

  const isAdmin = profile?.role === "admin"

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Einträge",
      icon: ClipboardList,
      href: "/entries",
      active: pathname === "/entries",
    },
    {
      label: "Projekte",
      icon: FolderKanban,
      href: "/projects",
      active: pathname === "/projects",
    },
    {
      label: "Zeiterfassung",
      icon: Clock,
      href: "/time-tracking",
      active: pathname === "/time-tracking",
    },
    {
      label: "Aufgaben",
      icon: CheckSquare,
      href: "/tasks",
      active: pathname === "/tasks",
    },
    {
      label: "Materialien",
      icon: Package,
      href: "/materials",
      active: pathname === "/materials",
    },
    {
      label: "Quittungen",
      icon: Receipt,
      href: "/receipts",
      active: pathname === "/receipts",
    },
    {
      label: "Galerie",
      icon: Images,
      href: "/gallery",
      active: pathname === "/gallery",
    },
    ...(isAdmin
      ? [
          {
            label: "Benutzer",
            icon: Users,
            href: "/users",
            active: pathname === "/users",
          },
        ]
      : []),
    {
      label: "Einstellungen",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  return (
    <div className={cn("pb-12 border-r h-full flex flex-col", className)} {...props}>
      <div className="space-y-4 py-4 flex flex-col h-full">
        <div className="px-3 py-2 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center">
            <h2 className="text-lg font-semibold tracking-tight">HandwerkersZeit</h2>
          </Link>
          <ModeToggle />
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  route.active && "bg-accent text-accent-foreground",
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="h-4 w-4 mr-3" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="px-3 py-2">
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">{profile?.full_name || user?.email}</p>
                <p className="text-xs text-muted-foreground">{isAdmin ? "Administrator" : "Benutzer"}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut()} title="Abmelden" aria-label="Abmelden">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
