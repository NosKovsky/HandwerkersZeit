"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QuickActions } from "@/components/smart-features/quick-actions"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ImportantTodosWidget } from "@/components/dashboard/important-todos-widget"
import { MaterialInventory } from "@/components/materials/material-inventory"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">🔨 Dashboard</h1>
          <p className="text-gray-600">Alles auf einen Blick - einfach und schnell</p>
        </div>

        {/* Statistiken */}
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schnellaktionen */}
          <QuickActions />

          {/* Materialbestand */}
          <MaterialInventory />
        </div>

        {/* Wichtige TODOs */}
        <ImportantTodosWidget />
      </div>
    </DashboardLayout>
  )
}
