import { type NextRequest, NextResponse } from "next/server"
import { analyzeAdvancedWorkEntry } from "@/lib/openai-advanced"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "Transcript ist erforderlich" }, { status: 400 })
    }

    // KI-Analyse
    const analysis = await analyzeAdvancedWorkEntry(transcript)

    // Kunde suchen oder erstellen
    let customerId = null
    if (analysis.customer) {
      const supabase = await createSupabaseServerActionClient()

      // Erst nach existierendem Kunden suchen
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .ilike("name", `%${analysis.customer.name}%`)
        .limit(1)
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        // Neuen Kunden erstellen
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: analysis.customer.name,
            street: analysis.customer.address.street,
            city: analysis.customer.address.city,
            zip_code: analysis.customer.address.zipCode,
          })
          .select("id")
          .single()

        if (!customerError && newCustomer) {
          customerId = newCustomer.id
        }
      }
    }

    // Baustelle suchen oder erstellen
    let projectId = null
    if (analysis.location && customerId) {
      const supabase = await createSupabaseServerActionClient()

      // Nach Baustelle suchen
      const { data: existingProject } = await supabase
        .from("projects")
        .select("id")
        .eq("customer_id", customerId)
        .ilike("address", `%${analysis.location.street}%`)
        .limit(1)
        .single()

      if (existingProject) {
        projectId = existingProject.id
      } else {
        // Neue Baustelle erstellen
        const { data: newProject, error: projectError } = await supabase
          .from("projects")
          .insert({
            name: `Baustelle ${analysis.customer?.name || "Unbekannt"}`,
            address: `${analysis.location.street}, ${analysis.location.zipCode || ""} ${analysis.location.city}`.trim(),
            customer_id: customerId,
            status: "Aktiv",
          })
          .select("id")
          .single()

        if (!projectError && newProject) {
          projectId = newProject.id
        }
      }
    }

    return NextResponse.json({
      ...analysis,
      customerId,
      projectId,
    })
  } catch (error) {
    console.error("Advanced speech analysis error:", error)
    return NextResponse.json({ error: "Fehler bei der erweiterten Sprachanalyse" }, { status: 500 })
  }
}
