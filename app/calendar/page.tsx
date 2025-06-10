import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default function CalendarPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Kalender
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Kalender wird entwickelt</h3>
              <p className="text-muted-foreground">
                Die Kalender-Funktionalität wird in einer zukünftigen Version verfügbar sein.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
