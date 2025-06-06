"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp } from "lucide-react"

// Mock data für Charts
const weeklyHoursData = [
  { day: "Mo", hours: 8.5, target: 8 },
  { day: "Di", hours: 7.2, target: 8 },
  { day: "Mi", hours: 9.1, target: 8 },
  { day: "Do", hours: 8.8, target: 8 },
  { day: "Fr", hours: 6.5, target: 8 },
  { day: "Sa", hours: 4.2, target: 0 },
  { day: "So", hours: 0, target: 0 },
]

const monthlyRevenueData = [
  { month: "Jan", revenue: 12500, hours: 168 },
  { month: "Feb", revenue: 14200, hours: 185 },
  { month: "Mar", revenue: 13800, hours: 178 },
  { month: "Apr", revenue: 15600, hours: 195 },
  { month: "Mai", revenue: 16200, hours: 203 },
  { month: "Jun", revenue: 15400, hours: 188 },
]

const projectDistributionData = [
  { name: "Dachsanierung", value: 35, color: "#f97316" },
  { name: "Neubau", value: 28, color: "#3b82f6" },
  { name: "Reparaturen", value: 22, color: "#10b981" },
  { name: "Wartung", value: 15, color: "#8b5cf6" },
]

const dailyActivityData = [
  { time: "06:00", activity: 0 },
  { time: "07:00", activity: 2 },
  { time: "08:00", activity: 8 },
  { time: "09:00", activity: 9 },
  { time: "10:00", activity: 8.5 },
  { time: "11:00", activity: 7 },
  { time: "12:00", activity: 1 },
  { time: "13:00", activity: 8 },
  { time: "14:00", activity: 9 },
  { time: "15:00", activity: 8.5 },
  { time: "16:00", activity: 7 },
  { time: "17:00", activity: 3 },
  { time: "18:00", activity: 0 },
]

export function AnalyticsCharts() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Arbeitszeit-Analytics
          </CardTitle>
          <CardDescription>Detaillierte Auswertung Ihrer Arbeitszeiten und Produktivität</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="weekly">Woche</TabsTrigger>
              <TabsTrigger value="monthly">Monat</TabsTrigger>
              <TabsTrigger value="projects">Projekte</TabsTrigger>
              <TabsTrigger value="daily">Tagesverlauf</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Wöchentliche Arbeitszeiten</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Diese Woche: 44.3h
                </Badge>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyHoursData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Monatlicher Umsatz-Trend</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  +12% vs. Vormonat
                </Badge>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value: any, name: string) => [
                        name === "revenue" ? `${value.toLocaleString()} €` : `${value}h`,
                        name === "revenue" ? "Umsatz" : "Stunden",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Projekt-Verteilung</h3>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  8 aktive Projekte
                </Badge>
              </div>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value: any) => [`${value}%`, "Anteil"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {projectDistributionData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-auto text-gray-600">{item.value}%</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="daily" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Täglicher Aktivitätsverlauf</h3>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Heute: 8.5h
                </Badge>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value: any) => [`${value}h`, "Aktivität"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="activity"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
