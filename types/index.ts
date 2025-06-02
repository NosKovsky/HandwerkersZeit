export type SelectedMaterialItem = {
  material_id: string
  name: string
  unit: string | null
  quantity: number
}

export type ProjectStatus = "active" | "paused" | "completed"
export type CommentStatus = "NEU" | "OFFEN" | "ERLEDIGT"
export type UserRole = "admin" | "user"

export interface ApiResponse<T = any> {
  success: boolean
  error?: string
  data?: T
}
