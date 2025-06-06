"use client"

import { LayoutDashboard, ListChecks, MapPin, Settings, Users, FileText, Calendar, Receipt } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

const sidebarItems = [
  {
    title: "Übersicht",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Baustellen",
    href: "/baustellen",
    icon: MapPin,
  },
  {
    title: "Kunden",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Aufgaben",
    href: "/tasks",
    icon: ListChecks,
  },
  {
    title: "Berichte",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Kalender",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Rechnungen",
    href: "/invoicing",
    icon: Receipt,
  },
  {
    title: "Einstellungen",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Navigation</h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
