"use server"

import { createSupabaseServerActionClient } from "@/lib/supabase/actions"
import { getStorageUrl, STORAGE_BUCKETS } from "@/lib/supabase/storage"

export type GalleryImage = {
  id: string
  type: "entry" | "receipt"
  url: string
  fileName: string | null
  uploadedAt: string
  projectId: string | null
  projectName: string | null
  contextName: string
  contextDate: string
}

async function getUserProfile() {
  try {
    const supabase = await createSupabaseServerActionClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error:", userError)
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      return null
    }

    return profile
  } catch (error) {
    console.error("Unexpected error in getUserProfile:", error)
    return null
  }
}

export async function getGalleryImages(filters?: { projectId?: string }): Promise<GalleryImage[]> {
  try {
    const supabase = await createSupabaseServerActionClient()
    const profile = await getUserProfile()
    if (!profile) return []

    const galleryImages: GalleryImage[] = []

    // Bilder aus Einträgen laden
    try {
      let entryImagesQuery = supabase.from("entry_images").select(`
          id, 
          image_path, 
          file_name, 
          uploaded_at, 
          entries!inner(
            project_id, 
            activity, 
            entry_date, 
            projects(name)
          )
        `)

      if (profile.role !== "admin") {
        entryImagesQuery = entryImagesQuery.eq("user_id", profile.id)
      }

      if (filters?.projectId) {
        entryImagesQuery = entryImagesQuery.eq("entries.project_id", filters.projectId)
      }

      const { data: entryImagesData, error: entryImagesError } = await entryImagesQuery

      if (entryImagesError) {
        console.error("Error fetching entry images for gallery:", entryImagesError)
      } else if (entryImagesData) {
        entryImagesData.forEach((img) => {
          const entry = img.entries as any
          if (img.image_path) {
            galleryImages.push({
              id: img.id,
              type: "entry",
              url: getStorageUrl(STORAGE_BUCKETS.ENTRY_IMAGES, img.image_path),
              fileName: img.file_name,
              uploadedAt: img.uploaded_at,
              projectId: entry?.project_id || null,
              projectName: entry?.projects?.name || null,
              contextName: entry?.activity || "Eintrag",
              contextDate: entry?.entry_date || img.uploaded_at,
            })
          }
        })
      }
    } catch (error) {
      console.error("Error processing entry images:", error)
    }

    // Bilder aus Quittungen laden
    try {
      let receiptImagesQuery = supabase
        .from("receipts")
        .select(`
          id, 
          image_path, 
          company_name, 
          category, 
          receipt_date, 
          project_id, 
          created_at,
          projects(name)
        `)
        .not("image_path", "is", null)

      if (profile.role !== "admin") {
        receiptImagesQuery = receiptImagesQuery.eq("user_id", profile.id)
      }

      if (filters?.projectId) {
        receiptImagesQuery = receiptImagesQuery.eq("project_id", filters.projectId)
      }

      const { data: receiptImagesData, error: receiptImagesError } = await receiptImagesQuery

      if (receiptImagesError) {
        console.error("Error fetching receipt images for gallery:", receiptImagesError)
      } else if (receiptImagesData) {
        receiptImagesData.forEach((rec) => {
          if (rec.image_path) {
            galleryImages.push({
              id: rec.id,
              type: "receipt",
              url: getStorageUrl(STORAGE_BUCKETS.RECEIPT_IMAGES, rec.image_path),
              fileName: rec.image_path.split("/").pop() || null,
              uploadedAt: rec.created_at || rec.receipt_date,
              projectId: rec.project_id || null,
              projectName: rec.projects?.name || null,
              contextName: rec.company_name || rec.category || "Quittung",
              contextDate: rec.receipt_date,
            })
          }
        })
      }
    } catch (error) {
      console.error("Error processing receipt images:", error)
    }

    // Nach Kontext-Datum sortieren (neueste zuerst)
    return galleryImages.sort((a, b) => new Date(b.contextDate).getTime() - new Date(a.contextDate).getTime())
  } catch (error) {
    console.error("Unexpected error in getGalleryImages:", error)
    return []
  }
}
