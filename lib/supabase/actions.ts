"use server" // Sicherstellen, dass dies nur serverseitig importiert wird

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

// Diese Funktion ist für Server Actions gedacht
export async function createSupabaseServerActionClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Für die meisten Aktionen reicht der anon key, wenn RLS richtig konfiguriert ist
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // In Server Actions wollen wir normalerweise keine Cookies setzen,
          // es sei denn, es ist eine Auth-Aktion. Für normale Datenaktionen ist dies nicht nötig.
          // cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // cookieStore.set({ name, value: '', ...options });
        },
      },
    },
  )
}

// Diese Funktion verwendet den Service Role Key für privilegierte Operationen,
// die RLS umgehen müssen (z.B. von einem Admin ausgeführt, der spezielle Rechte hat,
// die nicht einfach durch `auth.uid()` in RLS abgedeckt sind).
// SEHR VORSICHTIG VERWENDEN!
export async function createSupabaseServiceRoleClient() {
  // Importiere createClient direkt von supabase-js für den Service Role Key
  const { createClient } = await import("@supabase/supabase-js")

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set for service role client.")
  }
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
