"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QuickActions } from "@/components/smart-features/quick-actions"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ImportantTodosWidget } from "@/components/dashboard/important-todos-widget"
import { MaterialInventory } from "@/components/materials/material-inventory"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LogOut, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { profile, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    window.location.href = "/login"
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        {/* Header mit Logout und Theme Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🔨 Dashboard</h1>
            <p className="text-muted-foreground">Willkommen zurück, {profile?.full_name || "Handwerker"}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{profile?.position || "Mitarbeiter"}</span>
            </Badge>
            <ModeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Abmelden</span>
            </Button>
          </div>
        </div>

        {/* Statistiken */}
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schnellaktionen */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Schnellaktionen</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>

          {/* Materialbestand */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📦</span>
                <span>Materialbestand</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MaterialInventory />
            </CardContent>
          </Card>
        </div>

        {/* Wichtige TODOs */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📋</span>
              <span>Wichtige Aufgaben</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImportantTodosWidget />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
