"use client"

import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FolderOpen, Clock, Users, Settings, LogOut } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projekte", href: "/projects", icon: FolderOpen },
  { name: "Zeiterfassung", href: "/time-tracking", icon: Clock },
  { name: "Benutzerverwaltung", href: "/users", icon: Users, adminOnly: true },
  { name: "Einstellungen", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const pathname = usePathname()

  const filteredNavigation = navigation.filter((item) => !item.adminOnly || profile?.role === "admin")

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">AI Work Tracker</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile?.full_name || profile?.email}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {profile?.role === "admin" ? "Administrator" : "Benutzer"}
          </p>
        </div>
        <Button onClick={signOut} variant="outline" size="sm" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Abmelden
        </Button>
      </div>
    </div>
  )
}
