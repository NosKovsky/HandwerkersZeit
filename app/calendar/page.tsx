import { MainLayout } from "@/components/layout/main-layout"
import { ProjectCalendar } from "@/components/calendar/project-calendar"

export default function CalendarPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <ProjectCalendar />
      </div>
    </MainLayout>
  )
}
