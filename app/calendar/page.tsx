import { ProjectCalendar } from "@/components/calendar/project-calendar"
import { MainLayout } from "@/components/layout/main-layout"

export default function CalendarPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <ProjectCalendar />
      </div>
    </MainLayout>
  )
}
