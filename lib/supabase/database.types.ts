export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: "admin" | "user"
          position: string | null // Neue Spalte für die Position
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: "admin" | "user"
          position?: string | null // Neue Spalte für die Position
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: "admin" | "user"
          position?: string | null // Neue Spalte für die Position
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          id: string
          name: string
          address: string | null
          description: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          id: string
          name: string
          unit: string | null
          description: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          unit?: string | null
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          unit?: string | null
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entries: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          entry_date: string // date
          entry_time: string // time
          activity: string
          materials_used: Json | null // [{ material_id: UUID, quantity: number, name: string, unit: string }]
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
          activity: string
          materials_used?: Json | null
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
          activity?: string
          materials_used?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "entry_images_entry_id_fkey"
            columns: ["entry_id"]
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_images_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          id: string
          entry_id: string | null
          project_id: string | null
          author_id: string
          recipient_ids: string[] | null
          content: string
          status: "NEU" | "OFFEN" | "ERLEDIGT"
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
          status?: "NEU" | "OFFEN" | "ERLEDIGT"
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
          status?: "NEU" | "OFFEN" | "ERLEDIGT"
          is_procurement?: boolean
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_entry_id_fkey"
            columns: ["entry_id"]
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          company_name: string | null
          amount: number // decimal
          receipt_date: string // date
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
        Relationships: [
          {
            foreignKeyName: "receipts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
