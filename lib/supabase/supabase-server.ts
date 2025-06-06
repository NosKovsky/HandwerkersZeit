import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./database.types" // Ensure this path is correct

// Make sure this function is EXPORTED
export function createSupabaseServerActionClient() {
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

// If you have another function for read-only server operations, export it too
export function createSupabaseServerClient(readOnly = false) {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    readOnly ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! : process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // Note: For read-only client, set and remove might not be strictly necessary
        // but keeping them for consistency or potential future use.
        set(name: string, value: string, options: CookieOptions) {
          if (!readOnly) {
            // Only attempt to set cookies if not read-only
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Handle cases where cookies can't be set (e.g., during RSC build)
              console.warn(`Could not set cookie ${name} in read-only client:`, error)
            }
          }
        },
        remove(name: string, options: CookieOptions) {
          if (!readOnly) {
            // Only attempt to remove cookies if not read-only
            try {
              cookieStore.set({ name, value: "", ...options })
            } catch (error) {
              // Handle cases where cookies can't be set
              console.warn(`Could not remove cookie ${name} in read-only client:`, error)
            }
          }
        },
      },
    },
  )
}
