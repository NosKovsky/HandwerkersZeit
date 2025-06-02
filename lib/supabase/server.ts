import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

export function createSupabaseServerClient(cookieStore?: ReturnType<typeof cookies>) {
  const store = cookieStore || cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          store.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          store.set({ name, value: "", ...options })
        },
      },
    },
  )
}

export function createSupabaseRouteHandlerClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )
}

export async function createSupabaseAdminClient() {
  const { createServerClient: createAdminClient } = await import("@supabase/supabase-js")
  // This client is meant for server-side operations that require service_role key
  // Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set for admin client.")
  }
  return createAdminClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
