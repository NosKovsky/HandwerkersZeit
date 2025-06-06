import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerActionClient } from "@/lib/supabase/actions"

interface DeliveryItem {
  name: string
  quantity: number
  unit: string
  meters_per_piece?: number
}

interface DeliveryData {
  items: DeliveryItem[]
}

export async function POST(request: NextRequest) {
  try {
    const deliveryData: DeliveryData = await request.json()
    const supabase = await createSupabaseServerActionClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const results = []

    for (const item of deliveryData.items) {
      // Material in der Datenbank suchen
      const { data: existingMaterial } = await supabase
        .from("materials")
        .select("*")
        .ilike("name", `%${item.name}%`)
        .single()

      if (existingMaterial) {
        // Bestand aktualisieren
        const newStock = (existingMaterial.current_stock || 0) + item.quantity

        await supabase.from("materials").update({ current_stock: newStock }).eq("id", existingMaterial.id)

        // Transaktion protokollieren
        await supabase.from("material_transactions").insert({
          material_id: existingMaterial.id,
          quantity: item.quantity,
          transaction_type: "add",
          notes: `Lieferung per Sprache erfasst: ${item.quantity} ${item.unit}`,
          created_by: user.id,
        })

        results.push({
          material: existingMaterial.name,
          added: item.quantity,
          newStock: newStock,
        })
      } else {
        // Neues Material erstellen
        const { data: newMaterial } = await supabase
          .from("materials")
          .insert({
            name: item.name,
            unit: item.unit,
            current_stock: item.quantity,
            min_stock: 10,
            unit_price: 0,
            created_by: user.id,
            description: `Automatisch erstellt durch Lieferung`,
            meters_per_piece: item.meters_per_piece || null,
          })
          .select()
          .single()

        if (newMaterial) {
          await supabase.from("material_transactions").insert({
            material_id: newMaterial.id,
            quantity: item.quantity,
            transaction_type: "add",
            notes: `Erste Lieferung per Sprache erfasst: ${item.quantity} ${item.unit}`,
            created_by: user.id,
          })

          results.push({
            material: newMaterial.name,
            added: item.quantity,
            newStock: item.quantity,
            isNew: true,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} Materialien erfolgreich aktualisiert`,
      results,
    })
  } catch (error) {
    console.error("Process delivery error:", error)
    return NextResponse.json({ error: "Unerwarteter Fehler" }, { status: 500 })
  }
}
