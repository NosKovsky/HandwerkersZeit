"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { Clock, Euro, Package, FileText, Download, Building, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { DateRange } from "react-day-picker"

interface AnalyticsData {
  timeTracking: {
    totalHours: number
    billableHours: number
    efficiency: number
    dailyHours: Array<{ date: string; hours: number }>
    projectHours: Array<{ project: string; hours: number; percentage: number }>
  }
  financial: {
    totalRevenue: number
    expenses: number
    profit: number
    monthlyRevenue: Array<{ month: string; revenue: number; expenses: number }>
    projectProfitability: Array<{ project: string; revenue: number; costs: number; profit: number }>
  }
  materials: {
    totalCost: number
    mostUsed: Array<{ material: string; quantity: number; cost: number }>
    wastePercentage: number
    supplierBreakdown: Array<{ supplier: string; amount: number; percentage: number }>
  }
  projects: {
    completed: number
    active: number
    delayed: number
    averageCompletion: number
    projectTimeline: Array<{ project: string; planned: number; actual: number; status: string }>
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
    to: new Date(),
  })

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: dateRange?.from?.toISOString(),
          to: dateRange?.to?.toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Fehler beim Laden der Daten")

      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error("Analytics error:", error)
      toast.error("Fehler beim Laden der Analysedaten")
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: "pdf" | "excel") => {
    try {
      toast.loading(`Erstelle ${format.toUpperCase()}-Bericht...`)

      const response = await fetch("/api/export-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          data,
          dateRange: {
            from: dateRange?.from?.toISOString(),
            to: dateRange?.to?.toISOString(),
          },
        }),
      })

      if (!response.ok) throw new Error("Export fehlgeschlagen")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bericht-${new Date().toISOString().split("T")[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${format.toUpperCase()}-Bericht erfolgreich erstellt!`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Fehler beim Erstellen des Berichts")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Analysedaten...</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Keine Daten verfügbar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header mit Filteroptionen */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">📊 Erweiterte Analysen</CardTitle>
              <CardDescription className="text-lg">Detaillierte Einblicke in Ihre Geschäftsdaten</CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
              <div className="flex gap-2">
                <Button onClick={() => exportReport("pdf")} className="bg-red-500 hover:bg-red-600">
                  <FileText className="h-4 w-4 mr-2" />
                  PDF Export
                </Button>
                <Button onClick={() => exportReport("excel")} className="bg-green-500 hover:bg-green-600">
                  <Download className="h-4 w-4 mr-2" />
                  Excel Export
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Gesamtstunden</p>
                <p className="text-3xl font-bold text-blue-900">{data.timeTracking.totalHours}h</p>
                <p className="text-blue-600 text-sm">{data.timeTracking.billableHours}h abrechenbar</p>
              </div>
              <Clock className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Umsatz</p>
                <p className="text-3xl font-bold text-green-900">€{data.financial.totalRevenue.toLocaleString()}</p>
                <p className="text-green-600 text-sm">€{data.financial.profit.toLocaleString()} Gewinn</p>
              </div>
              <Euro className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Materialkosten</p>
                <p className="text-3xl font-bold text-orange-900">€{data.materials.totalCost.toLocaleString()}</p>
                <p className="text-orange-600 text-sm">{data.materials.wastePercentage}% Verschnitt</p>
              </div>
              <Package className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Projekte</p>
                <p className="text-3xl font-bold text-purple-900">{data.projects.completed}</p>
                <p className="text-purple-600 text-sm">
                  {data.projects.active} aktiv, {data.projects.delayed} verspätet
                </p>
              </div>
              <Building className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detaillierte Analysen */}
      <Tabs defaultValue="time" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="time">⏰ Zeiterfassung</TabsTrigger>
          <TabsTrigger value="financial">💰 Finanzen</TabsTrigger>
          <TabsTrigger value="materials">📦 Materialien</TabsTrigger>
          <TabsTrigger value="projects">🏗️ Projekte</TabsTrigger>
        </TabsList>

        <TabsContent value="time" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tägliche Arbeitsstunden */}
            <Card>
              <CardHeader>
                <CardTitle>Tägliche Arbeitsstunden</CardTitle>
                <CardDescription>Verlauf der letzten 30 Tage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.timeTracking.dailyHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="hours" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stunden pro Projekt */}
            <Card>
              <CardHeader>
                <CardTitle>Stunden pro Projekt</CardTitle>
                <CardDescription>Verteilung der Arbeitszeit</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.timeTracking.projectHours}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ project, percentage }) => `${project}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="hours"
                    >
                      {data.timeTracking.projectHours.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Effizienz-Metriken */}
          <Card>
            <CardHeader>
              <CardTitle>Effizienz-Analyse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{data.timeTracking.efficiency}%</div>
                  <p className="text-gray-600">Arbeitseffizienz</p>
                  <Badge variant={data.timeTracking.efficiency > 80 ? "default" : "secondary"}>
                    {data.timeTracking.efficiency > 80 ? "Sehr gut" : "Verbesserungspotential"}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {((data.timeTracking.billableHours / data.timeTracking.totalHours) * 100).toFixed(1)}%
                  </div>
                  <p className="text-gray-600">Abrechenbare Zeit</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {(data.timeTracking.totalHours / 30).toFixed(1)}h
                  </div>
                  <p className="text-gray-600">Ø Stunden/Tag</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monatlicher Umsatz */}
            <Card>
              <CardHeader>
                <CardTitle>Monatlicher Umsatz vs. Ausgaben</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.financial.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#10B981" name="Umsatz" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Ausgaben" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Projekt-Rentabilität */}
            <Card>
              <CardHeader>
                <CardTitle>Projekt-Rentabilität</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.financial.projectProfitability.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{project.project}</p>
                        <p className="text-sm text-gray-600">
                          Umsatz: €{project.revenue.toLocaleString()} | Kosten: €{project.costs.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${project.profit > 0 ? "text-green-600" : "text-red-600"}`}>
                          €{project.profit.toLocaleString()}
                        </p>
                        <Badge variant={project.profit > 0 ? "default" : "destructive"}>
                          {((project.profit / project.revenue) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meist verwendete Materialien */}
            <Card>
              <CardHeader>
                <CardTitle>Meist verwendete Materialien</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.materials.mostUsed} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="material" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="cost" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lieferanten-Aufschlüsselung */}
            <Card>
              <CardHeader>
                <CardTitle>Lieferanten-Verteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.materials.supplierBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ supplier, percentage }) => `${supplier}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {data.materials.supplierBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Projekt-Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Projekt-Timeline: Geplant vs. Tatsächlich</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.projects.projectTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="project" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="planned" fill="#94A3B8" name="Geplant (Tage)" />
                  <Bar dataKey="actual" fill="#3B82F6" name="Tatsächlich (Tage)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projekt-Status Übersicht */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{data.projects.completed}</div>
                <p className="text-green-700 font-medium">Abgeschlossene Projekte</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{data.projects.active}</div>
                <p className="text-blue-700 font-medium">Aktive Projekte</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{data.projects.delayed}</div>
                <p className="text-red-700 font-medium">Verspätete Projekte</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
