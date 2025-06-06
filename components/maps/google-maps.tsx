"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Navigation, Search } from "lucide-react"

interface GoogleMapsProps {
  apiKey: string // Changed from process.env
  address?: string
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  height?: string
  zoom?: number
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function GoogleMaps({ apiKey, address, onLocationSelect, height = "400px", zoom = 15 }: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState(address || "")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap()
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initializeMap
      document.head.appendChild(script)
    }

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return

      const defaultLocation = { lat: 51.1657, lng: 10.4515 } // Deutschland Zentrum

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: zoom,
        center: defaultLocation,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      })

      setMap(mapInstance)
      setIsLoaded(true)

      // Wenn eine Adresse übergeben wurde, diese geocodieren
      if (address) {
        geocodeAddress(address, mapInstance)
      }

      // Click-Event für Kartenklicks
      mapInstance.addListener("click", (event: any) => {
        const location = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        }

        // Reverse Geocoding für Adresse
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location }, (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            const address = results[0].formatted_address
            updateMarker(location, mapInstance, address)
            onLocationSelect?.({ ...location, address })
          }
        })
      })
    }

    loadGoogleMaps()
  }, [apiKey, address, zoom])

  const geocodeAddress = (address: string, mapInstance: any) => {
    const geocoder = new window.google.maps.Geocoder()

    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location
        const position = {
          lat: location.lat(),
          lng: location.lng(),
        }

        mapInstance.setCenter(position)
        updateMarker(position, mapInstance, results[0].formatted_address)
        onLocationSelect?.({ ...position, address: results[0].formatted_address })
      }
    })
  }

  const updateMarker = (position: { lat: number; lng: number }, mapInstance: any, title?: string) => {
    // Alten Marker entfernen
    if (marker) {
      marker.setMap(null)
    }

    // Neuen Marker erstellen
    const newMarker = new window.google.maps.Marker({
      position,
      map: mapInstance,
      title: title || "Ausgewählte Position",
      draggable: true,
    })

    // Drag-Event für Marker
    newMarker.addListener("dragend", (event: any) => {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      }

      // Reverse Geocoding für neue Position
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: newPosition }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          onLocationSelect?.({ ...newPosition, address: results[0].formatted_address })
        }
      })
    })

    setMarker(newMarker)
  }

  const handleSearch = () => {
    if (searchQuery && map) {
      geocodeAddress(searchQuery, map)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          map.setCenter(location)
          map.setZoom(16)

          // Reverse Geocoding für aktuelle Position
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location }, (results: any, status: any) => {
            if (status === "OK" && results[0]) {
              updateMarker(location, map, "Aktuelle Position")
              onLocationSelect?.({ ...location, address: results[0].formatted_address })
            }
          })
        },
        (error) => {
          console.error("Geolocation error:", error)
        },
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Standort
        </CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Adresse suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} size="sm">
            <Search className="h-4 w-4" />
          </Button>
          <Button onClick={getCurrentLocation} size="sm" variant="outline">
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} style={{ height, width: "100%" }} className="rounded-md border" />
        {!isLoaded && (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-muted-foreground">Karte wird geladen...</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
