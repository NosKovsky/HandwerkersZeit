"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TimeEntryForm } from "@/components/time-tracking/time-entry-form"

export default function TimeTrackingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Laden...</div>
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Zeiterfassung</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          <TimeEntryForm />

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Letzte Einträge</h3>
            <p className="text-gray-500 dark:text-gray-400">Zeiteinträge werden hier angezeigt...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
