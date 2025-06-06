"use client"

import { useEffect, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import * as google from "google.maps"

interface GoogleMapsServerProps {
  address?: string
  className?: string
}

export function GoogleMapsServer({ address, className = "w-full h-64" }: GoogleMapsServerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)

  useEffect(() => {
    // Load the Google Maps API
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Google Maps API key is missing")
      return
    }

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    })

    let mapInstance: google.maps.Map | null = null
    let geocoderInstance: google.maps.Geocoder | null = null

    loader.load().then(() => {
      const mapElement = document.getElementById("map")
      if (mapElement) {
        mapInstance = new google.maps.Map(mapElement, {
          center: { lat: 51.1657, lng: 10.4515 }, // Default to Germany
          zoom: 6,
        })
        setMap(mapInstance)

        geocoderInstance = new google.maps.Geocoder()
        setGeocoder(geocoderInstance)

        // If address is provided, geocode it
        if (address) {
          geocodeAddress(address, geocoderInstance, mapInstance)
        }
      }
    })

    return () => {
      // Cleanup
      setMap(null)
      setGeocoder(null)
    }
  }, [])

  // Update map when address changes
  useEffect(() => {
    if (geocoder && map && address) {
      geocodeAddress(address, geocoder, map)
    }
  }, [address, geocoder, map])

  const geocodeAddress = (address: string, geocoder: google.maps.Geocoder, map: google.maps.Map) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        map.setCenter(results[0].geometry.location)
        map.setZoom(15)
        new google.maps.Marker({
          map,
          position: results[0].geometry.location,
        })
      } else {
        console.error(`Geocode was not successful for the following reason: ${status}`)
      }
    })
  }

  return <div id="map" className={className}></div>
}
