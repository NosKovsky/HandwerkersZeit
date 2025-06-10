"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { ModeToggle } from "@/components/layout/mode-toggle"
import {
  Home,
  Building,
  Clock,
  Package,
  Receipt,
  Users,
  Settings,
  Calendar,
  BarChart3,
  Euro,
  LogOut,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
    badge: null,
  },
  {
    title: "Zeiterfassung",
    icon: Clock,
    href: "/entries",
    badge: null,
  },
  {
    title: "Baustellen",
    icon: Building,
    href: "/baustellen",
    badge: null,
  },
  {
    title: "Materialien",
    icon: Package,
    href: "/materials",
    badge: null,
  },
  {
    title: "Belege",
    icon: Receipt,
    href: "/receipts",
    badge: null,
  },
  {
    title: "Kunden",
    icon: Users,
    href: "/customers",
    badge: null,
  },
  {
    title: "Kalender",
    icon: Calendar,
    href: "/calendar",
    badge: "Neu",
  },
  {
    title: "Berichte",
    icon: BarChart3,
    href: "/reports",
    badge: "Pro",
  },
  {
    title: "Rechnungen",
    icon: Euro,
    href: "/invoicing",
    badge: "Neu",
  },
  {
    title: "Einstellungen",
    icon: Settings,
    href: "/settings",
    badge: null,
  },
]

export function EnhancedSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  const getBadgeVariant = (badge: string | null) => {
    switch (badge) {
      case "Neu":
        return "default"
      case "Pro":
        return "secondary"
      case "KI":
        return "destructive"
      case "PWA":
        return "outline"
      default:
        return "default"
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto flex flex-col">
      <div className="p-6 flex-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">🔨 AI Work Tracker</h2>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.title} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  isActive(item.href) && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant={getBadgeVariant(item.badge)} className="text-xs ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section mit Logout und Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center justify-between">
          <ModeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
