"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SwipeContainer } from "@/components/mobile/swipe-container"
import { Building, Clock, ChevronRight, MapPin, User, Calendar } from "lucide-react"
import { formatDate } from "@/utils/format-date"

interface Baustelle {
  id: string
  name: string
  address: string
  start_date: string
  customer_name?: string
  active: boolean
}

interface MobileBaustellenListProps {
  baustellen: Baustelle[]
}

export function MobileBaustellenList({ baustellen }: MobileBaustellenListProps) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleSwipeLeft = (id: string) => {
    setExpandedId(id)
  }

  const handleSwipeRight = (id: string) => {
    setExpandedId(null)
  }

  const navigateToBaustelle = (id: string) => {
    router.push(`/baustellen/${id}`)
  }

  return (
    <div className="space-y-4">
      {baustellen.map((baustelle) => (
        <SwipeContainer
          key={baustelle.id}
          onSwipeLeft={() => handleSwipeLeft(baustelle.id)}
          onSwipeRight={() => handleSwipeRight(baustelle.id)}
        >
          <Card
            className={`border-l-4 ${
              baustelle.active ? "border-l-green-500" : "border-l-gray-300"
            } transition-all duration-300 relative overflow-hidden`}
            onClick={() => navigateToBaustelle(baustelle.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">{baustelle.name}</h3>
                    {baustelle.active && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Aktiv
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[200px]">{baustelle.address}</span>
                  </div>
                  {baustelle.customer_name && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                      <User className="h-3 w-3" />
                      <span>{baustelle.customer_name}</span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(baustelle.start_date)}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Swipe Actions */}
              <div
                className={`absolute inset-y-0 right-0 flex items-center transition-transform duration-300 ${
                  expandedId === baustelle.id ? "translate-x-0" : "translate-x-full"
                }`}
                style={{ width: "120px" }}
              >
                <div className="flex h-full">
                  <Button
                    variant="default"
                    className="h-full rounded-none bg-blue-500 hover:bg-blue-600 flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/zeiterfassung/new?project=${baustelle.id}`)
                    }}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    className="h-full rounded-none flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Löschen-Funktion
                    }}
                  >
                    Löschen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </SwipeContainer>
      ))}
    </div>
  )
}
