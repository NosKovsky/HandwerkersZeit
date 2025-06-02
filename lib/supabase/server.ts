import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

// Die ursprüngliche Funktion mit dem erwarteten Namen
export function createSupabaseServerClient(cookieStore?: ReturnType<typeof cookies>) {
  const store = cookieStore || cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            return store.get(name)?.value
          } catch (error) {
            console.error("Fehler beim Abrufen des Cookies:", error)
            return undefined
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            store.set({ name, value, ...options })
          } catch (error) {
            console.error("Fehler beim Setzen des Cookies:", error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            store.set({ name, value: "", ...options })
          } catch (error) {
            console.error("Fehler beim Löschen des Cookies:", error)
          }
        },
      },
    },
  )
}

// Die ursprüngliche Funktion mit dem erwarteten Namen
export function createSupabaseRouteHandlerClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value
          } catch (error) {
            console.error("Fehler beim Abrufen des Cookies:", error)
            return undefined
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error("Fehler beim Setzen des Cookies:", error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            console.error("Fehler beim Löschen des Cookies:", error)
          }
        },
      },
    },
  )
}

// Hilfsfunktion mit Timeout-Schutz für die Session
export async function getServerSession() {
  const supabase = createSupabaseServerClient()

  try {
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Session timeout")), 2000))

    const { data } = (await Promise.race([
      sessionPromise,
      timeoutPromise.then(() => ({ data: { session: null } })),
    ])) as { data: { session: any } }

    return data.session
  } catch (error) {
    console.error("Fehler beim Abrufen der Session:", error)
    return null
  }
}

export async function createSupabaseAdminClient() {
  const { createClient } = await import("@supabase/supabase-js")
  // This client is meant for server-side operations that require service_role key
  // Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set for admin client.")
  }
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
