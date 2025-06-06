"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Send, Clock, Package, Plus, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  type: "labor" | "material" | "other"
}

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  customerId: string
  projectId: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes: string
  paymentTerms: string
}

export function InvoiceGenerator() {
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: `RE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    customerId: "",
    projectId: "",
    items: [],
    subtotal: 0,
    taxRate: 19,
    taxAmount: 0,
    total: 0,
    notes: "",
    paymentTerms: "Zahlbar innerhalb von 14 Tagen ohne Abzug.",
  })

  const [customers, setCustomers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [invoice.items, invoice.taxRate])

  const loadData = async () => {
    try {
      const [customersRes, projectsRes] = await Promise.all([fetch("/api/customers"), fetch("/api/projects")])

      const customersData = await customersRes.json()
      const projectsData = await projectsRes.json()

      setCustomers(customersData)
      setProjects(projectsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Fehler beim Laden der Daten")
    }
  }

  const loadProjectData = async (projectId: string) => {
    if (!projectId) return

    setLoading(true)
    try {
      const [timeRes, materialsRes] = await Promise.all([
        fetch(`/api/time-entries?projectId=${projectId}&unbilled=true`),
        fetch(`/api/materials-used?projectId=${projectId}&unbilled=true`),
      ])

      const timeData = await timeRes.json()
      const materialsData = await materialsRes.json()

      setTimeEntries(timeData)
      setMaterials(materialsData)

      // Automatisch Positionen hinzufügen
      autoAddItems(timeData, materialsData)
    } catch (error) {
      console.error("Error loading project data:", error)
      toast.error("Fehler beim Laden der Projektdaten")
    } finally {
      setLoading(false)
    }
  }

  const autoAddItems = (timeData: any[], materialsData: any[]) => {
    const newItems: InvoiceItem[] = []

    // Arbeitszeit-Positionen
    const laborHours = timeData.reduce((total, entry) => {
      if (entry.entry_time && entry.end_time) {
        const start = new Date(`2000-01-01T${entry.entry_time}`)
        const end = new Date(`2000-01-01T${entry.end_time}`)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return total + hours
      }
      return total
    }, 0)

    if (laborHours > 0) {
      newItems.push({
        id: `labor-${Date.now()}`,
        description: "Arbeitsleistung",
        quantity: Math.round(laborHours * 100) / 100,
        unit: "Stunden",
        unitPrice: 65,
        totalPrice: Math.round(laborHours * 65 * 100) / 100,
        type: "labor",
      })
    }

    // Material-Positionen
    materialsData.forEach((material, index) => {
      newItems.push({
        id: `material-${Date.now()}-${index}`,
        description: material.name,
        quantity: material.quantity || 1,
        unit: material.unit || "Stück",
        unitPrice: material.estimatedPrice || 0,
        totalPrice: (material.quantity || 1) * (material.estimatedPrice || 0),
        type: "material",
      })
    })

    setInvoice((prev) => ({ ...prev, items: newItems }))
  }

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const taxAmount = (subtotal * invoice.taxRate) / 100
    const total = subtotal + taxAmount

    setInvoice((prev) => ({
      ...prev,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    }))
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      unit: "Stück",
      unitPrice: 0,
      totalPrice: 0,
      type: "other",
    }

    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.totalPrice = Math.round(updatedItem.quantity * updatedItem.unitPrice * 100) / 100
          }
          return updatedItem
        }
        return item
      }),
    }))
  }

  const removeItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const generateInvoice = async (action: "preview" | "download" | "send") => {
    if (!invoice.customerId || invoice.items.length === 0) {
      toast.error("Bitte wählen Sie einen Kunden und fügen Sie Positionen hinzu")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/generate-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice, action }),
      })

      if (!response.ok) throw new Error("Fehler beim Generieren der Rechnung")

      if (action === "preview") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, "_blank")
        setPreviewMode(true)
      } else if (action === "download") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Rechnung-${invoice.invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Rechnung erfolgreich heruntergeladen!")
      } else if (action === "send") {
        toast.success("Rechnung erfolgreich versendet!")
      }
    } catch (error) {
      console.error("Invoice generation error:", error)
      toast.error("Fehler beim Generieren der Rechnung")
    } finally {
      setLoading(false)
    }
  }

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "labor":
        return <Clock className="h-4 w-4" />
      case "material":
        return <Package className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getItemTypeBadge = (type: string) => {
    switch (type) {
      case "labor":
        return <Badge variant="default">Arbeitszeit</Badge>
      case "material":
        return <Badge variant="secondary">Material</Badge>
      default:
        return <Badge variant="outline">Sonstiges</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Rechnung erstellen
          </CardTitle>
          <CardDescription className="text-lg">
            Erstellen Sie professionelle Rechnungen aus Ihren Zeiterfassungen und Materialien
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">📋 Details</TabsTrigger>
          <TabsTrigger value="items">📦 Positionen</TabsTrigger>
          <TabsTrigger value="preview">👁️ Vorschau</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rechnungsdetails */}
            <Card>
              <CardHeader>
                <CardTitle>Rechnungsdetails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Rechnungsnummer</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoice.invoiceNumber}
                      onChange={(e) => setInvoice((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Rechnungsdatum</Label>
                    <Input
                      id="date"
                      type="date"
                      value={invoice.date}
                      onChange={(e) => setInvoice((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoice.dueDate}
                      onChange={(e) => setInvoice((prev) => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Steuersatz (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={invoice.taxRate}
                      onChange={(e) => setInvoice((prev) => ({ ...prev, taxRate: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Zahlungsbedingungen</Label>
                  <Textarea
                    id="paymentTerms"
                    value={invoice.paymentTerms}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Bemerkungen</Label>
                  <Textarea
                    id="notes"
                    value={invoice.notes}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Zusätzliche Bemerkungen zur Rechnung..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Kunde & Projekt */}
            <Card>
              <CardHeader>
                <CardTitle>Kunde & Projekt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Kunde</Label>
                  <Select
                    value={invoice.customerId}
                    onValueChange={(value) => setInvoice((prev) => ({ ...prev, customerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kunde auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Projekt (optional)</Label>
                  <Select
                    value={invoice.projectId || "default"}
                    onValueChange={(value) => {
                      setInvoice((prev) => ({ ...prev, projectId: value }))
                      loadProjectData(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Projekt auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Kein Projekt</SelectItem>
                      {projects
                        .filter((p) => !invoice.customerId || p.customer_id === invoice.customerId)
                        .map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Lade Projektdaten...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rechnungspositionen</CardTitle>
                <Button onClick={addItem} className="bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Position hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Position {index + 1}</span>
                        {getItemTypeBadge(item.type)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <Label>Beschreibung</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="Leistungsbeschreibung"
                        />
                      </div>
                      <div>
                        <Label>Menge</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Einheit</Label>
                        <Select value={item.unit} onValueChange={(value) => updateItem(item.id, "unit", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Stück">Stück</SelectItem>
                            <SelectItem value="Stunden">Stunden</SelectItem>
                            <SelectItem value="Meter">Meter</SelectItem>
                            <SelectItem value="m²">m²</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="Pauschal">Pauschal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Einzelpreis (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Gesamtpreis (€)</Label>
                        <Input value={item.totalPrice.toFixed(2)} readOnly className="bg-gray-50" />
                      </div>
                    </div>
                  </div>
                ))}

                {invoice.items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Positionen hinzugefügt</p>
                    <p className="text-sm">Wählen Sie ein Projekt aus oder fügen Sie manuell Positionen hinzu</p>
                  </div>
                )}
              </div>

              {/* Summen */}
              {invoice.items.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-2">
                      <div className="flex justify-between">
                        <span>Zwischensumme:</span>
                        <span>€{invoice.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MwSt. ({invoice.taxRate}%):</span>
                        <span>€{invoice.taxAmount.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Gesamtsumme:</span>
                        <span>€{invoice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rechnungsvorschau</CardTitle>
              <CardDescription>Überprüfen Sie Ihre Rechnung vor dem Versenden</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Rechnungskopf */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-lg mb-2">Rechnungsadresse</h3>
                    {invoice.customerId ? (
                      <div className="text-gray-700">
                        {customers.find((c) => c.id === invoice.customerId)?.name}
                        <br />
                        {customers.find((c) => c.id === invoice.customerId)?.street}
                        <br />
                        {customers.find((c) => c.id === invoice.customerId)?.zip_code}{" "}
                        {customers.find((c) => c.id === invoice.customerId)?.city}
                      </div>
                    ) : (
                      <p className="text-gray-500">Kein Kunde ausgewählt</p>
                    )}
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg mb-2">Rechnungsdetails</h3>
                    <div className="text-gray-700">
                      <p>Rechnungsnummer: {invoice.invoiceNumber}</p>
                      <p>Datum: {new Date(invoice.date).toLocaleDateString("de-DE")}</p>
                      <p>Fällig: {new Date(invoice.dueDate).toLocaleDateString("de-DE")}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Positionen */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Leistungen</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Pos.</th>
                          <th className="text-left p-2">Beschreibung</th>
                          <th className="text-right p-2">Menge</th>
                          <th className="text-right p-2">Einheit</th>
                          <th className="text-right p-2">Einzelpreis</th>
                          <th className="text-right p-2">Gesamtpreis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item, index) => (
                          <tr key={item.id} className="border-b">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{item.description}</td>
                            <td className="text-right p-2">{item.quantity}</td>
                            <td className="text-right p-2">{item.unit}</td>
                            <td className="text-right p-2">€{item.unitPrice.toFixed(2)}</td>
                            <td className="text-right p-2">€{item.totalPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summen */}
                <div className="flex justify-end">
                  <div className="w-80 space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span>Zwischensumme:</span>
                      <span>€{invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MwSt. ({invoice.taxRate}%):</span>
                      <span>€{invoice.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Gesamtsumme:</span>
                      <span>€{invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Zahlungsbedingungen */}
                {invoice.paymentTerms && (
                  <div>
                    <h3 className="font-bold text-lg mb-2">Zahlungsbedingungen</h3>
                    <p className="text-gray-700">{invoice.paymentTerms}</p>
                  </div>
                )}

                {/* Bemerkungen */}
                {invoice.notes && (
                  <div>
                    <h3 className="font-bold text-lg mb-2">Bemerkungen</h3>
                    <p className="text-gray-700">{invoice.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              onClick={() => generateInvoice("preview")}
              disabled={loading || !invoice.customerId || invoice.items.length === 0}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Eye className="h-4 w-4 mr-2" />
              PDF Vorschau
            </Button>
            <Button
              onClick={() => generateInvoice("download")}
              disabled={loading || !invoice.customerId || invoice.items.length === 0}
              className="bg-green-500 hover:bg-green-600"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF Download
            </Button>
            <Button
              onClick={() => generateInvoice("send")}
              disabled={loading || !invoice.customerId || invoice.items.length === 0}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Send className="h-4 w-4 mr-2" />
              Per E-Mail senden
            </Button>
          </div>
          {(!invoice.customerId || invoice.items.length === 0) && (
            <p className="text-center text-gray-500 mt-4">
              Bitte wählen Sie einen Kunden und fügen Sie Positionen hinzu
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
