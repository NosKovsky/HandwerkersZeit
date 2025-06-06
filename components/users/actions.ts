"use server"
import { createSupabaseServiceRoleClient } from "@/lib/supabase/actions"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/database.types"

type UserProfile = Database["public"]["Tables"]["profiles"]["Row"] & {
  user_groups: {
    id: string
    name: string
    color: string
  } | null
}

type UserGroup = Database["public"]["Tables"]["user_groups"]["Row"] & {
  permissions: Array<{
    id: string
    name: string
    description: string | null
    category: string
  }>
}

export async function getAllUsers(): Promise<{ users: UserProfile[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseServiceRoleClient()

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        user_groups (
          id,
          name,
          color
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return { users: null, error: error.message }
    }

    return { users: data as UserProfile[], error: null }
  } catch (error) {
    return {
      users: null,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    }
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServiceRoleClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    }
  }
}

export async function getUserGroups(): Promise<{ groups: UserGroup[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseServiceRoleClient()

    const { data, error } = await supabase
      .from("user_groups")
      .select(`
        *,
        group_permissions (
          permissions (
            id,
            name,
            description,
            category
          )
        )
      `)
      .order("sort_order", { ascending: true })

    if (error) {
      return { groups: null, error: error.message }
    }

    // Transformiere die Daten für einfachere Verwendung
    const transformedGroups = data.map((group) => ({
      ...group,
      permissions: group.group_permissions?.map((gp) => gp.permissions).filter(Boolean) || [],
    }))

    return { groups: transformedGroups as UserGroup[], error: null }
  } catch (error) {
    return {
      groups: null,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    }
  }
}

export async function createUserGroup(
  groupData: Database["public"]["Tables"]["user_groups"]["Insert"],
): Promise<{ success: boolean; error?: string; groupId?: string }> {
  try {
    const supabase = await createSupabaseServiceRoleClient()

    const { data, error } = await supabase.from("user_groups").insert(groupData).select("id").single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/users")
    return { success: true, groupId: data.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    }
  }
}

export async function updateGroupPermissions(
  groupId: string,
  permissionIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServiceRoleClient()

    // Erst alle bestehenden Berechtigungen für diese Gruppe löschen
    await supabase.from("group_permissions").delete().eq("group_id", groupId)

    // Dann neue Berechtigungen hinzufügen
    if (permissionIds.length > 0) {
      const { error } = await supabase.from("group_permissions").insert(
        permissionIds.map((permissionId) => ({
          group_id: groupId,
          permission_id: permissionId,
        })),
      )

      if (error) {
        return { success: false, error: error.message }
      }
    }

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    }
  }
}

export async function getAllPermissions(): Promise<{
  permissions: Database["public"]["Tables"]["permissions"]["Row"][] | null
  error: string | null
}> {
  try {
    const supabase = await createSupabaseServiceRoleClient()

    const { data, error } = await supabase.from("permissions").select("*").order("category", { ascending: true })

    if (error) {
      return { permissions: null, error: error.message }
    }

    return { permissions: data, error: null }
  } catch (error) {
    return {
      permissions: null,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    }
  }
}

// Legacy function für Kompatibilität
export async function updateUserRole(userId: string, role: "admin" | "user") {
  return updateUserProfile(userId, { role })
}
