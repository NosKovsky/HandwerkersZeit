"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Building, Clock, Star } from "lucide-react"

interface StatItemProps {
  icon: React.ComponentType<any>
  value: number
  label: string
  suffix?: string
  color: string
}

function StatItem({ icon: Icon, value, label, suffix = "", color }: StatItemProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isVisible) {
      const duration = 2000 // 2 Sekunden
      const steps = 60
      const increment = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [isVisible, value])

  return (
    <Card
      ref={ref}
      className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <CardContent className="p-6">
        <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {displayValue.toLocaleString()}
          {suffix}
        </div>
        <div className="text-gray-600 font-medium">{label}</div>
      </CardContent>
    </Card>
  )
}

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Vertrauen Sie auf bewährte Qualität</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Über 1.000 Handwerksbetriebe nutzen bereits HandwerkersZeit für ihre tägliche Arbeit
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatItem icon={Users} value={1247} label="Aktive Nutzer" color="bg-blue-600" />
          <StatItem icon={Building} value={856} label="Betriebe" color="bg-orange-600" />
          <StatItem icon={Clock} value={45678} label="Erfasste Stunden" color="bg-green-600" />
          <StatItem icon={Star} value={98} label="Zufriedenheit" suffix="%" color="bg-yellow-600" />
        </div>
      </div>
    </section>
  )
}
