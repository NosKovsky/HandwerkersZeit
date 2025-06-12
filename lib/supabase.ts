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
          address: string | null
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          name: string
          unit: string | null
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          unit?: string | null
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          unit?: string | null
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      entries: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          entry_date: string
          entry_time: string
          end_time: string | null
          activity: string
          materials_used: any
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          entry_date: string
          entry_time: string
          end_time?: string | null
          activity: string
          materials_used?: any
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          entry_date?: string
          entry_time?: string
          end_time?: string | null
          activity?: string
          materials_used?: any
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      entry_images: {
        Row: {
          id: string
          entry_id: string
          user_id: string
          image_path: string
          file_name: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          user_id: string
          image_path: string
          file_name?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          user_id?: string
          image_path?: string
          file_name?: string | null
          uploaded_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          entry_id: string | null
          project_id: string | null
          author_id: string
          recipient_ids: string[] | null
          content: string
          status: string
          is_procurement: boolean
          parent_comment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entry_id?: string | null
          project_id?: string | null
          author_id: string
          recipient_ids?: string[] | null
          content: string
          status?: string
          is_procurement?: boolean
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entry_id?: string | null
          project_id?: string | null
          author_id?: string
          recipient_ids?: string[] | null
          content?: string
          status?: string
          is_procurement?: boolean
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          company_name: string | null
          amount: number
          receipt_date: string
          category: string | null
          description: string | null
          image_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          company_name?: string | null
          amount: number
          receipt_date: string
          category?: string | null
          description?: string | null
          image_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          company_name?: string | null
          amount?: number
          receipt_date?: string
          category?: string | null
          description?: string | null
          image_path?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
