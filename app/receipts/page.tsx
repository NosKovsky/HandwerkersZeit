"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import Layout from "@/components/layout"
import AuthGuard from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, Camera, Euro, Calendar, Building, Search, Filter, Download } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Receipt {
  id: string
  amount: number
  company: string
  description: string
  category: string
  date: string
  image_url: string | null
  created_at: string
}

const categories = [
  "Tankquittung",
  "Material Barzahlung",
  "Werkzeug",
  "Verpflegung",
  "Fahrtkosten",
  "Übernachtung",
  "Sonstiges",
]

export default function ReceiptsPage() {
  const { user } = useAuth()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    company: "",
    description: "",
    category: categories[0],
    date: new Date().toISOString().split("T")[0],
    image: null as File | null,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState({
    category: categories[0], // Updated default value to be a non-empty string
    month: new Date().toISOString().slice(0, 7),
    minAmount: "",
    maxAmount: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      fetchReceipts()
    }
  }, [user])

  useEffect(() => {
    filterReceipts()
  }, [receipts, searchTerm, filter])

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .eq("user_id", user!.id)
        .order("date", { ascending: false })

      if (error) throw error
      setReceipts(data || [])
    } catch (error) {
      console.error("Error fetching receipts:", error)
      setError("Fehler beim Laden der Quittungen")
    } finally {
      setLoading(false)
    }
  }

  const filterReceipts = () => {
    let filtered = receipts

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (receipt) =>
          receipt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          receipt.company.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (filter.category) {
      filtered = filtered.filter((receipt) => receipt.category === filter.category)
    }

    // Month filter
    if (filter.month) {
      filtered = filtered.filter((receipt) => receipt.date.startsWith(filter.month))
    }

    // Amount filters
    if (filter.minAmount) {
      filtered = filtered.filter((receipt) => receipt.amount >= Number.parseFloat(filter.minAmount))
    }
    if (filter.maxAmount) {
      filtered = filtered.filter((receipt) => receipt.amount <= Number.parseFloat(filter.maxAmount))
    }

    setFilteredReceipts(filtered)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      let imageUrl = null

      // Upload image if provided
      if (formData.image) {
        const fileName = `receipts/${Date.now()}-${formData.image.name}`
        const { data, error } = await supabase.storage.from("images").upload(fileName, formData.image)

        if (error) throw error
        imageUrl = data.path
      }

      // Create receipt
      const { error } = await supabase.from("receipts").insert({
        user_id: user!.id,
        amount: Number.parseFloat(formData.amount),
        company: formData.company,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        image_url: imageUrl,
      })

      if (error) throw error

      setSuccess("Quittung erfolgreich erstellt!")
      setFormData({
        amount: "",
        company: "",
        description: "",
        category: categories[0],
        date: new Date().toISOString().split("T")[0],
        image: null,
      })
      setShowForm(false)
      fetchReceipts()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const exportReceipts = async () => {
    try {
      const csvContent = [
        ["Datum", "Firma", "Beschreibung", "Kategorie", "Betrag"].join(","),
        ...filteredReceipts.map((receipt) =>
          [
            receipt.date,
            `"${receipt.company}"`,
            `"${receipt.description}"`,
            receipt.category,
            receipt.amount.toFixed(2),
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `quittungen-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError("Fehler beim Exportieren")
    }
  }

  const totalAmount = filteredReceipts.reduce((sum, receipt) => sum + receipt.amount, 0)

  if (loading && receipts.length === 0) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner size="lg" />
          </div>
        </Layout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quittungen</h1>
              <p className="mt-2 text-gray-600">Verwalten Sie Ihre Ausgaben und Quittungen</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportReceipts}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Neue Quittung
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filter & Suche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Suche</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Firma oder Beschreibung..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category-filter">Kategorie</Label>
                  <Select
                    value={filter.category}
                    onValueChange={(value) => setFilter((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alle Kategorien" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={categories[0]}>Alle Kategorien</SelectItem>{" "}
                      {/* Updated to have a non-empty value */}
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="month-filter">Monat</Label>
                  <Input
                    id="month-filter"
                    type="month"
                    value={filter.month}
                    onChange={(e) => setFilter((prev) => ({ ...prev, month: e.target.value }))}
                  />
                </div>

                <div className="flex items-end">
                  <div className="text-sm">
                    <span className="font-medium">Gesamtsumme: </span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(totalAmount)}</span>
                    <div className="text-xs text-gray-500">{filteredReceipts.length} Quittungen</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="min-amount">Min. Betrag (€)</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filter.minAmount}
                    onChange={(e) => setFilter((prev) => ({ ...prev, minAmount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="max-amount">Max. Betrag (€)</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    step="0.01"
                    placeholder="999.99"
                    value={filter.maxAmount}
                    onChange={(e) => setFilter((prev) => ({ ...prev, maxAmount: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Form Modal */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Neue Quittung</CardTitle>
                <CardDescription>Erfassen Sie eine neue Quittung mit allen relevanten Informationen</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Betrag (€) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Datum *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Firma/Geschäft *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                      placeholder="z.B. Baumarkt XY"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Beschreibung *</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Was wurde gekauft?"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Kategorie *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategorie wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label>Quittungsbild</Label>
                    <div className="mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="mr-2 h-4 w-4" />
                        {formData.image ? "Bild ändern" : "Bild hinzufügen"}
                      </Button>
                    </div>

                    {formData.image && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(formData.image) || "/placeholder.svg"}
                          alt="Quittung"
                          className="w-32 h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Wird gespeichert..." : "Quittung erstellen"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Receipts List */}
          <div className="space-y-4">
            {filteredReceipts.map((receipt) => (
              <Card key={receipt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(receipt.date)}
                        </span>
                        <span className="flex items-center">
                          <Building className="mr-1 h-4 w-4" />
                          {receipt.company}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{receipt.description}</h3>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-green-600 font-bold text-xl">
                          <Euro className="mr-1 h-5 w-5" />
                          {formatCurrency(receipt.amount)}
                        </span>
                        <Badge variant="secondary">{receipt.category}</Badge>
                      </div>
                    </div>
                    {receipt.image_url && (
                      <div className="ml-4">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${receipt.image_url}`}
                          alt="Quittung"
                          className="w-20 h-20 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
                          onClick={() =>
                            window.open(
                              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${receipt.image_url}`,
                              "_blank",
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReceipts.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-8">
                <Euro className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Quittungen gefunden</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {receipts.length === 0 ? "Erstellen Sie Ihre erste Quittung." : "Versuchen Sie andere Suchkriterien."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </AuthGuard>
  )
}
