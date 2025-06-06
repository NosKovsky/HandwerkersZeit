import { AdvancedAnalytics } from "@/components/reports/advanced-analytics"
import { MainLayout } from "@/components/layout/main-layout"

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <AdvancedAnalytics />
      </div>
    </MainLayout>
  )
}
