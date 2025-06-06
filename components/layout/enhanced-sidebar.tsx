"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  ChevronDown,
  ChevronRight,
  Smartphone,
  Zap,
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
    children: [
      { title: "Einträge", href: "/entries" },
      { title: "Spracherfassung", href: "/entries/voice" },
      { title: "Mobile Erfassung", href: "/entries/mobile" },
    ],
  },
  {
    title: "Baustellen",
    icon: Building,
    href: "/baustellen",
    badge: null,
    children: [
      { title: "Übersicht", href: "/baustellen" },
      { title: "Neue Baustelle", href: "/baustellen/new" },
      { title: "Dokumente", href: "/baustellen/documents" },
    ],
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
    children: [
      { title: "Monatsansicht", href: "/calendar" },
      { title: "Projektplanung", href: "/calendar/projects" },
      { title: "Termine", href: "/calendar/appointments" },
    ],
  },
  {
    title: "Berichte",
    icon: BarChart3,
    href: "/reports",
    badge: "Pro",
    children: [
      { title: "Analysen", href: "/reports" },
      { title: "Zeitauswertung", href: "/reports/time" },
      { title: "Kosten", href: "/reports/costs" },
      { title: "Export", href: "/reports/export" },
    ],
  },
  {
    title: "Rechnungen",
    icon: Euro,
    href: "/invoicing",
    badge: "Neu",
    children: [
      { title: "Erstellen", href: "/invoicing" },
      { title: "Übersicht", href: "/invoicing/list" },
      { title: "Zahlungen", href: "/invoicing/payments" },
    ],
  },
  {
    title: "KI-Features",
    icon: Zap,
    href: "/ai",
    badge: "KI",
    children: [
      { title: "Sprachsteuerung", href: "/ai/voice" },
      { title: "Smart Analyse", href: "/ai/analysis" },
      { title: "Materialvorschläge", href: "/ai/suggestions" },
    ],
  },
  {
    title: "Mobile",
    icon: Smartphone,
    href: "/mobile",
    badge: "PWA",
    children: [
      { title: "Offline-Modus", href: "/mobile/offline" },
      { title: "Kamera", href: "/mobile/camera" },
      { title: "Standort", href: "/mobile/location" },
    ],
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

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">🔨 AI Work Tracker</h2>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <Collapsible open={expandedItems.includes(item.title)} onOpenChange={() => toggleExpanded(item.title)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        isActive(item.href) && "bg-blue-100 text-blue-700",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant={getBadgeVariant(item.badge)} className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {expandedItems.includes(item.title) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-8 mt-1">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            isActive(child.href) && "bg-blue-50 text-blue-600",
                          )}
                        >
                          {child.title}
                        </Button>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      isActive(item.href) && "bg-blue-100 text-blue-700",
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
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
