import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    "https://mpwsenysgufpfsinyjjh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wd3NlbnlzZ3VmcGZzaW55ampoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODk3NDcsImV4cCI6MjA2NDQ2NTc0N30.z5vTUjbWrYHFsgc2-RizpBgeFRC8wno8x1_kCfhQq6Q",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.error("Fehler beim Setzen der Cookies:", error)
          }
        },
      },
    },
  )
}

export function createSupabaseRouteHandlerClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    "https://mpwsenysgufpfsinyjjh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wd3NlbnlzZ3VmcGZzaW55ampoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODk3NDcsImV4cCI6MjA2NDQ2NTc0N30.z5vTUjbWrYHFsgc2-RizpBgeFRC8wno8x1_kCfhQq6Q",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.error("Fehler beim Setzen der Cookies:", error)
          }
        },
      },
    },
  )
}

export async function createSupabaseAdminClient() {
  const { createClient } = await import("@supabase/supabase-js")

  return createClient<Database>(
    "https://mpwsenysgufpfsinyjjh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wd3NlbnlzZ3VmcGZzaW55ampoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg4OTc0NywiZXhwIjoyMDY0NDY1NzQ3fQ.piT0SCxr0x3nHUidMbWWxK8Vle3EI1uz6bD0seaGkG0",
  )
}
