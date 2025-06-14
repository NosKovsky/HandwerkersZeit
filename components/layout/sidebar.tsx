"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Clock, Building, Package, Receipt, Users, Settings, Menu, X, Calendar, BarChart3, FileDown } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Zeiterfassung",
    href: "/entries",
    icon: Clock,
  },
  {
    title: "Baustellen",
    href: "/baustellen",
    icon: Building,
  },
  {
    title: "Export",
    href: "/baustellen/export",
    icon: FileDown,
  },
  {
    title: "Materialien",
    href: "/materials",
    icon: Package,
  },
  {
    title: "Belege",
    href: "/receipts",
    icon: Receipt,
  },
  {
    title: "Kunden",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Kalender",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Berichte",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Einstellungen",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(!isMobile)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const sidebarVariants = {
    open: { width: isMobile ? "100%" : "240px", opacity: 1, x: 0 },
    closed: { width: "0px", opacity: 0, x: -20 },
  }

  const menuButtonVariants = {
    open: { left: isMobile ? "calc(100% - 56px)" : "200px" },
    closed: { left: "12px" },
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.div
        className="fixed top-4 z-50 md:hidden"
        initial={isOpen ? "open" : "closed"}
        animate={isOpen ? "open" : "closed"}
        variants={menuButtonVariants}
        transition={{ duration: 0.3 }}
      >
        <Button variant="outline" size="icon" className="rounded-full bg-background shadow-md" onClick={toggleSidebar}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.div
            className={cn(
              "fixed inset-y-0 left-0 z-40 flex flex-col bg-card border-r shadow-sm md:relative",
              isMobile ? "w-full md:w-64" : "w-64",
            )}
            initial={isMobile ? "closed" : "open"}
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-6">
              <div className="flex items-center gap-2 font-bold text-2xl mb-8">
                <span className="text-primary">🔨</span>
                <span>HandwerksZeit</span>
              </div>
              <ScrollArea className="h-[calc(100vh-120px)]">
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <Link key={item.href} href={item.href} passHref>
                      <Button
                        variant={pathname === item.href ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start text-left",
                          pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                        )}
                        onClick={() => isMobile && setIsOpen(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.title}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
