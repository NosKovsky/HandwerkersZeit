"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

export type DocumentType = "pdf" | "image" | "doc" | "xls" | "other"

export interface ProjectDocument {
  id: string
  project_id: string
  name: string
  file_path: string
  file_type: DocumentType
  file_size: number
  uploaded_by: string
  uploaded_at: string
  description?: string | null
  profiles?: {
    full_name: string
  } | null
}

export async function uploadProjectDocument(
  projectId: string,
  file: File,
  description?: string,
): Promise<{ success: boolean; error?: string; document?: ProjectDocument }> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Dateiendung überprüfen und Typ bestimmen
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
  let fileType: DocumentType = "other"

  if (["pdf"].includes(fileExtension)) {
    fileType = "pdf"
  } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
    fileType = "image"
  } else if (["doc", "docx", "txt", "rtf"].includes(fileExtension)) {
    fileType = "doc"
  } else if (["xls", "xlsx", "csv"].includes(fileExtension)) {
    fileType = "xls"
  }

  // Dateigröße überprüfen (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: "Die Datei darf maximal 10MB groß sein." }
  }

  try {
    // Eindeutigen Dateinamen generieren
    const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filePath = `project-documents/${projectId}/${fileName}`

    // Datei hochladen
    const { error: uploadError } = await supabase.storage.from("project-documents").upload(filePath, file)

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return { success: false, error: `Fehler beim Hochladen: ${uploadError.message}` }
    }

    // Dokument in der Datenbank speichern
    const { data: document, error: dbError } = await supabase
      .from("project_documents")
      .insert({
        project_id: projectId,
        name: file.name,
        file_path: filePath,
        file_type: fileType,
        file_size: file.size,
        uploaded_by: user.id,
        description: description || null,
      })
      .select("*, profiles(*)")
      .single()

    if (dbError) {
      console.error("Error saving document to database:", dbError)
      return { success: false, error: `Fehler beim Speichern: ${dbError.message}` }
    }

    return { success: true, document }
  } catch (error) {
    console.error("Unexpected error in uploadProjectDocument:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}

export async function getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  try {
    const { data, error } = await supabase
      .from("project_documents")
      .select("*, profiles(full_name)")
      .eq("project_id", projectId)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("Error fetching project documents:", error)
      return []
    }

    return data as ProjectDocument[]
  } catch (error) {
    console.error("Unexpected error in getProjectDocuments:", error)
    return []
  }
}

export async function deleteProjectDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  try {
    // Dokument aus der Datenbank abrufen
    const { data: document, error: fetchError } = await supabase
      .from("project_documents")
      .select("file_path")
      .eq("id", documentId)
      .single()

    if (fetchError || !document) {
      console.error("Error fetching document:", fetchError)
      return { success: false, error: "Dokument konnte nicht gefunden werden." }
    }

    // Datei aus dem Storage löschen
    const { error: storageError } = await supabase.storage.from("project-documents").remove([document.file_path])

    if (storageError) {
      console.error("Error deleting file from storage:", storageError)
      // Wir löschen trotzdem den Datenbankeintrag, auch wenn die Datei nicht gelöscht werden konnte
    }

    // Dokument aus der Datenbank löschen
    const { error: dbError } = await supabase.from("project_documents").delete().eq("id", documentId)

    if (dbError) {
      console.error("Error deleting document from database:", dbError)
      return { success: false, error: `Fehler beim Löschen: ${dbError.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected error in deleteProjectDocument:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}
