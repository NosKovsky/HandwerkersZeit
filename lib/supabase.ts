import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: "admin" | "user"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: "admin" | "user"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: "admin" | "user"
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: "active" | "paused" | "completed"
          budget: number | null
          start_date: string | null
          end_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: "active" | "paused" | "completed"
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: "active" | "paused" | "completed"
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          project_id: string
          user_id: string
          description: string | null
          hours: number
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          description?: string | null
          hours: number
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          description?: string | null
          hours?: number
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
