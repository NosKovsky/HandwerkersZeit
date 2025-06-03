"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { useAuth } from "@/contexts/auth-context"
import { useMobile } from "@/hooks/use-mobile"
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
  Menu,
  X,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const isMobile = useMobile()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

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

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-72 bg-background border-r transform transition-transform duration-300 ease-in-out md:hidden",
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">HandwerkersZeit</h2>
                <ModeToggle />
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    variant={route.active ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    asChild
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Link href={route.href}>
                      <route.icon className="h-4 w-4 mr-3" />
                      {route.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm">
                  <p className="font-medium truncate">{profile?.full_name || user?.email}</p>
                  <p className="text-xs text-muted-foreground">{isAdmin ? "Administrator" : "Benutzer"}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div
      className={cn(
        "hidden md:flex flex-col h-full bg-background border-r transition-all duration-300 ease-in-out",
        isExpanded ? "w-56" : "w-16",
        className,
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      {...props}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          {isExpanded && (
            <div className="ml-3 overflow-hidden">
              <h2 className="text-sm font-semibold whitespace-nowrap">HandwerkersZeit</h2>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start relative",
                !isExpanded && "px-2",
                route.active && "bg-accent text-accent-foreground",
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className="h-4 w-4 shrink-0" />
                {isExpanded && <span className="ml-3 whitespace-nowrap overflow-hidden">{route.label}</span>}
                {!isExpanded && route.active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
                )}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t">
        <div className="flex items-center">
          {!isExpanded && <ModeToggle />}
          {isExpanded && (
            <div className="flex items-center justify-between w-full">
              <div className="text-xs">
                <p className="font-medium truncate max-w-32">{profile?.full_name || user?.email}</p>
                <p className="text-muted-foreground">{isAdmin ? "Admin" : "Benutzer"}</p>
              </div>
              <div className="flex items-center space-x-1">
                <ModeToggle />
                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
