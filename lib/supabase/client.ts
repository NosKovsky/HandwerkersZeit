import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    "https://mpwsenysgufpfsinyjjh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wd3NlbnlzZ3VmcGZzaW55ampoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODk3NDcsImV4cCI6MjA2NDQ2NTc0N30.z5vTUjbWrYHFsgc2-RizpBgeFRC8wno8x1_kCfhQq6Q",
  )
}

// Zusätzlicher Export für Kompatibilität
export function createSupabaseClient() {
  return createSupabaseBrowserClient()
}
