"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, MapPin, Clock, MessageCircle, AlertTriangle, CheckCircle } from "lucide-react"

export function TeamSync() {
  const [teamStatus, setTeamStatus] = useState([
    {
      id: 1,
      name: "Chef",
      status: "active",
      location: "Büro",
      currentTask: "Planung neue Projekte",
      lastSeen: "vor 5 Min",
    },
    {
      id: 2,
      name: "Kollege Max",
      status: "active",
      location: "Baustelle Musterstraße",
      currentTask: "Dachziegel verlegen",
      lastSeen: "vor 2 Min",
    },
    {
      id: 3,
      name: "Du",
      status: "active",
      location: "Baustelle Hauptstraße",
      currentTask: "Material prüfen",
      lastSeen: "jetzt",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pause":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Arbeitet"
      case "pause":
        return "Pause"
      case "offline":
        return "Offline"
      default:
        return "Unbekannt"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team-Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamStatus.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                    ></div>
                  </div>

                  <div>
                    <p className="font-medium">{member.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{member.location}</span>
                    </div>
                    <p className="text-sm text-gray-600">{member.currentTask}</p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant={member.status === "active" ? "default" : "secondary"}>
                    {getStatusText(member.status)}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{member.lastSeen}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schnelle Team-Kommunikation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Schnell-Nachrichten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex-col">
              <CheckCircle className="h-5 w-5 mb-1 text-green-500" />
              <span className="text-sm">Alles OK</span>
            </Button>

            <Button variant="outline" className="h-16 flex-col">
              <AlertTriangle className="h-5 w-5 mb-1 text-yellow-500" />
              <span className="text-sm">Hilfe nötig</span>
            </Button>

            <Button variant="outline" className="h-16 flex-col">
              <Clock className="h-5 w-5 mb-1 text-blue-500" />
              <span className="text-sm">Verspätung</span>
            </Button>

            <Button variant="outline" className="h-16 flex-col">
              <MapPin className="h-5 w-5 mb-1 text-purple-500" />
              <span className="text-sm">Unterwegs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
