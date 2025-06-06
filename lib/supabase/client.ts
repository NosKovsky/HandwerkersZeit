import { createBrowserClient } from "@supabase/ssr"

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Keine Cookie-Konfiguration - verwendet automatisch document.cookie
  )
}

// Alias für Kompatibilität
export function createSupabaseClient() {
  return createSupabaseBrowserClient()
}

// Server action client - simplified version for client-side compatibility
export function createSupabaseServerActionClient() {
  return createSupabaseBrowserClient()
}

// Default export
export default createSupabaseClient
