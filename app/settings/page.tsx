import { MainLayout } from "@/components/layout/main-layout"
import { SettingsForm } from "@/components/settings/settings-form" // Erstellen wir als Nächstes
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, email, role").eq("id", user.id).single()

  return (
    <MainLayout>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kontoeinstellungen</CardTitle>
            <CardDescription>Verwalten Sie Ihre Kontoinformationen.</CardDescription>
          </CardHeader>
          <CardContent>
            {profile && <SettingsForm currentFullName={profile.full_name} />}
            <div className="mt-6 space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium">Weitere Informationen</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">E-Mail:</span> {profile?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Rolle:</span> {profile?.role === "admin" ? "Administrator" : "Benutzer"}
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Weitere Einstellungs-Karten hier, z.B. für Benachrichtigungen, Dark Mode etc. */}
      </div>
    </MainLayout>
  )
}
