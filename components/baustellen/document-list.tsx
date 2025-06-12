"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProjectDocuments, deleteProjectDocument, type ProjectDocument } from "@/app/baustellen/documents/actions"
import { toast } from "sonner"
import { DocumentUpload } from "./document-upload"
import {
  FileIcon,
  FileText,
  FileIcon as FilePdf,
  FileImage,
  FileSpreadsheet,
  Trash2,
  Download,
  FileQuestion,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getStorageUrl } from "@/lib/supabase/storage"

interface DocumentListProps {
  projectId: string
}

export function DocumentList({ projectId }: DocumentListProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [documentToDelete, setDocumentToDelete] = useState<ProjectDocument | null>(null)

  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const docs = await getProjectDocuments(projectId)
      setDocuments(docs)
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast.error("Fehler beim Laden der Dokumente")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [projectId])

  const handleDelete = async () => {
    if (!documentToDelete) return

    try {
      const result = await deleteProjectDocument(documentToDelete.id)

      if (result.success) {
        setDocuments((docs) => docs.filter((doc) => doc.id !== documentToDelete.id))
        toast.success("Dokument erfolgreich gelöscht")
      } else {
        toast.error(result.error || "Fehler beim Löschen")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Ein unerwarteter Fehler ist aufgetreten")
    } finally {
      setDocumentToDelete(null)
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FilePdf className="h-8 w-8 text-red-500" />
      case "image":
        return <FileImage className="h-8 w-8 text-blue-500" />
      case "doc":
        return <FileText className="h-8 w-8 text-indigo-500" />
      case "xls":
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />
      default:
        return <FileQuestion className="h-8 w-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const downloadDocument = (document: ProjectDocument) => {
    const url = getStorageUrl("project-documents", document.file_path)
    if (!url) {
      toast.error("Download-URL konnte nicht generiert werden")
      return
    }

    // Öffne in neuem Tab oder lade herunter
    window.open(url, "_blank")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <FileIcon className="mr-2 h-5 w-5 text-primary" />
          Dokumente
        </CardTitle>
        <DocumentUpload projectId={projectId} onDocumentUploaded={fetchDocuments} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Dokumente werden geladen...</p>
        ) : documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-start p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="mr-3 mt-1">{getDocumentIcon(doc.file_type)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{doc.name}</h4>
                  {doc.description && <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>Hochgeladen: {formatDate(doc.uploaded_at)}</span>
                    <span>Von: {doc.profiles?.full_name || "Unbekannt"}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => downloadDocument(doc)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDocumentToDelete(doc)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Keine Dokumente</h3>
            <p className="text-muted-foreground">Laden Sie Dokumente für diese Baustelle hoch.</p>
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dokument löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie das Dokument &quot;{documentToDelete?.name}&quot; löschen möchten? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
