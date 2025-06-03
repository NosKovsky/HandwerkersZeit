import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = createSupabaseServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/dashboard")
    } else {
      redirect("/login")
    }
  } catch (error) {
    redirect("/login")
  }
}
