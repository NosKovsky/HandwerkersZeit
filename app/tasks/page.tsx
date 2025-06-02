import { MainLayout } from "@/components/layout/main-layout"
import { TaskList } from "@/components/tasks/task-list" // Erstellen wir als Nächstes
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskForm } from "@/components/tasks/task-form"

export default async function TasksPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <MainLayout>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskList />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Neue Aufgabe / Kommentar</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
