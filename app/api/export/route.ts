import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import JSZip from "jszip"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const zip = new JSZip()

    // Fetch user data
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

    // Fetch entries
    const { data: entries } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    // Fetch receipts
    const { data: receipts } = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    // Fetch tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // Fetch task comments
    const { data: taskComments } = await supabase
      .from("task_comments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // Add JSON files to zip
    zip.file("profile.json", JSON.stringify(profile, null, 2))
    zip.file("entries.json", JSON.stringify(entries, null, 2))
    zip.file("receipts.json", JSON.stringify(receipts, null, 2))
    zip.file("tasks.json", JSON.stringify(tasks, null, 2))
    zip.file("task_comments.json", JSON.stringify(taskComments, null, 2))

    // Add CSV files for easier import into other systems
    if (entries && entries.length > 0) {
      const entriesCsv = [
        ["Datum", "Zeit", "Projekt", "Tätigkeit", "Material"].join(","),
        ...entries.map((entry) =>
          [entry.date, entry.time, `"${entry.project}"`, `"${entry.activity}"`, `"${entry.materials || ""}"`].join(","),
        ),
      ].join("\n")
      zip.file("entries.csv", entriesCsv)
    }

    if (receipts && receipts.length > 0) {
      const receiptsCsv = [
        ["Datum", "Firma", "Beschreibung", "Kategorie", "Betrag"].join(","),
        ...receipts.map((receipt) =>
          [
            receipt.date,
            `"${receipt.company}"`,
            `"${receipt.description}"`,
            receipt.category,
            receipt.amount.toFixed(2),
          ].join(","),
        ),
      ].join("\n")
      zip.file("receipts.csv", receiptsCsv)
    }

    // Add images
    const imageFolder = zip.folder("images")

    // Collect all image paths
    const imagePaths = new Set<string>()

    entries?.forEach((entry) => {
      if (entry.images) {
        entry.images.forEach((path: string) => imagePaths.add(path))
      }
    })

    receipts?.forEach((receipt) => {
      if (receipt.image_url) {
        imagePaths.add(receipt.image_url)
      }
    })

    // Download and add images to zip
    for (const imagePath of imagePaths) {
      try {
        const { data: imageData } = await supabase.storage.from("images").download(imagePath)

        if (imageData) {
          const arrayBuffer = await imageData.arrayBuffer()
          imageFolder?.file(imagePath.split("/").pop() || imagePath, arrayBuffer)
        }
      } catch (error) {
        console.error(`Error downloading image ${imagePath}:`, error)
      }
    }

    // Add README file
    const readme = `
# Bauleiter Dashboard Export

Exportiert am: ${new Date().toLocaleString("de-DE")}
Benutzer: ${profile?.name || profile?.email}

## Dateien:

### JSON Dateien (vollständige Daten):
- profile.json: Benutzerprofil
- entries.json: Arbeitseinträge
- receipts.json: Quittungen
- tasks.json: Aufgaben
- task_comments.json: Aufgaben-Kommentare

### CSV Dateien (für Import in andere Programme):
- entries.csv: Arbeitseinträge
- receipts.csv: Quittungen

### Bilder:
- images/: Alle hochgeladenen Bilder

## Statistiken:
- Einträge: ${entries?.length || 0}
- Quittungen: ${receipts?.length || 0}
- Aufgaben: ${tasks?.length || 0}
- Bilder: ${imagePaths.size}
`
    zip.file("README.txt", readme)

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: "blob" })

    return new NextResponse(zipBlob, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="bauleiter-export-${new Date().toISOString().split("T")[0]}.zip"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
