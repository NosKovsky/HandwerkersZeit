"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HardHat, Hammer, Wrench, Building, Zap, Ruler } from "lucide-react"

export function HandwerkerSection() {
  const handwerkerTypes = [
    {
      icon: HardHat,
      name: "Dachdecker",
      description: "Speziell für Dacharbeiten entwickelt",
      color: "bg-red-600",
      features: ["Wetter-Tracking", "Material-Kalkulation", "Sicherheits-Checklisten"],
    },
    {
      icon: Hammer,
      name: "Zimmerer",
      description: "Holzbau und Konstruktion",
      color: "bg-amber-600",
      features: ["Holz-Materialien", "Konstruktions-Pläne", "Maß-Dokumentation"],
    },
    {
      icon: Wrench,
      name: "Installateur",
      description: "Sanitär, Heizung, Klima",
      color: "bg-blue-600",
      features: ["Rohrleitungs-Pläne", "Druck-Tests", "Wartungs-Protokolle"],
    },
    {
      icon: Zap,
      name: "Elektriker",
      description: "Elektroinstallationen",
      color: "bg-yellow-600",
      features: ["Schaltpläne", "Messprotokoll", "Sicherheits-Prüfung"],
    },
    {
      icon: Building,
      name: "Maurer",
      description: "Hochbau und Renovierung",
      color: "bg-gray-600",
      features: ["Mörtel-Berechnung", "Mauer-Dokumentation", "Fortschritts-Fotos"],
    },
    {
      icon: Ruler,
      name: "Fliesenleger",
      description: "Fliesen und Bodenbeläge",
      color: "bg-teal-600",
      features: ["Flächen-Berechnung", "Muster-Dokumentation", "Fugen-Protokoll"],
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Für alle Gewerke
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Entwickelt von <span className="text-orange-600">echten Handwerkern</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Wir verstehen die Herausforderungen des Handwerks, weil wir selbst Handwerker sind. HandwerkersZeit wurde
            speziell für die Bedürfnisse verschiedener Gewerke entwickelt.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {handwerkerTypes.map((type, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50"
            >
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <type.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-gray-600">{type.description}</p>
                </div>

                <div className="space-y-2">
                  {type.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
