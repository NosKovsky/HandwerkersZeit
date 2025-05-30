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
          name: string | null
          role: "admin" | "user"
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: "admin" | "user"
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: "admin" | "user"
          created_at?: string
        }
      }
      entries: {
        Row: {
          id: string
          user_id: string
          date: string
          time: string
          project: string
          activity: string
          materials: string | null
          images: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          time: string
          project: string
          activity: string
          materials?: string | null
          images?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          time?: string
          project?: string
          activity?: string
          materials?: string | null
          images?: string[] | null
          created_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          name: string
          unit: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          unit?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          unit?: string | null
          created_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          user_id: string
          amount: number
          company: string
          description: string
          category: string
          date: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          company: string
          description: string
          category: string
          date: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          company?: string
          description?: string
          category?: string
          date?: string
          image_url?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: "new" | "open" | "completed"
          is_shopping: boolean
          assignee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: "new" | "open" | "completed"
          is_shopping?: boolean
          assignee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: "new" | "open" | "completed"
          is_shopping?: boolean
          assignee_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          comment?: string
          created_at?: string
        }
      }
    }
  }
}
