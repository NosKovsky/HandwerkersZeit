import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/database.types"

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error("Supabase URL is missing. NEXT_PUBLIC_SUPABASE_URL is not set or not accessible on the client.")
    throw new Error(
      "Client-side Supabase URL is missing. Ensure NEXT_PUBLIC_SUPABASE_URL is correctly set and accessible in your environment.",
    )
  }

  if (!supabaseAnonKey) {
    console.error(
      "Supabase Anon Key is missing. NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or not accessible on the client.",
    )
    throw new Error(
      "Client-side Supabase Anon Key is missing. Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is correctly set and accessible in your environment.",
    )
  }

  // Basic check for URL validity
  try {
    new URL(supabaseUrl)
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e)
    console.error(`Invalid Supabase URL format: '${supabaseUrl}'. Error: ${errorMessage}`)
    throw new Error(
      `Invalid Supabase URL format: '${supabaseUrl}'. Please check your NEXT_PUBLIC_SUPABASE_URL environment variable. Original error: ${errorMessage}`,
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
