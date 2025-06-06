import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"

export async function POST(request: NextRequest) {
  try {
    const { invoice, action } = await request.json()

    // Hier würde normalerweise ein PDF generiert werden
    // Für die Demo simulieren wir das

    if (action === "preview" || action === "download") {
      // Simuliere PDF-Generierung
      const pdfContent = generatePDFContent(invoice)

      // In der Realität würde hier ein echtes PDF mit einer Library wie puppeteer oder jsPDF erstellt
      const blob = new Blob([pdfContent], { type: "application/pdf" })

      return new Response(blob, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Rechnung-${invoice.invoiceNumber}.pdf"`,
        },
      })
    } else if (action === "send") {
      // Hier würde die E-Mail-Versendung implementiert
      // Für jetzt simulieren wir das

      const supabase = await createSupabaseServerActionClient()

      // Rechnung in DB speichern
      const { data: savedInvoice, error } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoice.invoiceNumber,
          customer_id: invoice.customerId,
          project_id: invoice.projectId || null,
          date: invoice.date,
          due_date: invoice.dueDate,
          subtotal: invoice.subtotal,
          tax_rate: invoice.taxRate,
          tax_amount: invoice.taxAmount,
          total: invoice.total,
          items: invoice.items,
          notes: invoice.notes,
          payment_terms: invoice.paymentTerms,
          status: "sent",
        })
        .select()
        .single()

      if (error) {
        console.error("Error saving invoice:", error)
        return NextResponse.json({ error: "Fehler beim Speichern der Rechnung" }, { status: 500 })
      }

      return NextResponse.json({ success: true, invoice: savedInvoice })
    }

    return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 })
  } catch (error) {
    console.error("Invoice generation error:", error)
    return NextResponse.json({ error: "Fehler beim Generieren der Rechnung" }, { status: 500 })
  }
}

function generatePDFContent(invoice: any): string {
  // Simulierter PDF-Inhalt als Text
  // In der Realität würde hier ein echtes PDF generiert
  return `
RECHNUNG ${invoice.invoiceNumber}

Datum: ${invoice.date}
Fällig: ${invoice.dueDate}

POSITIONEN:
${invoice.items
  .map(
    (item: any, index: number) =>
      `${index + 1}. ${item.description} - ${item.quantity} ${item.unit} à €${item.unitPrice} = €${item.totalPrice}`,
  )
  .join("\n")}

Zwischensumme: €${invoice.subtotal}
MwSt. (${invoice.taxRate}%): €${invoice.taxAmount}
GESAMTSUMME: €${invoice.total}

Zahlungsbedingungen: ${invoice.paymentTerms}
${invoice.notes ? `Bemerkungen: ${invoice.notes}` : ""}
`
}
