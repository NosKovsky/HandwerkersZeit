"use client"

import { useState, useEffect } from "react"

interface GoogleMapsProps {
  address?: string
  apiKey: string
  className?: string
}

export function GoogleMaps({ address, apiKey, className = "w-full h-64" }: GoogleMapsProps) {
  const [mapUrl, setMapUrl] = useState<string>("")

  useEffect(() => {
    if (address && apiKey) {
      const encodedAddress = encodeURIComponent(address)
      const url = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`
      setMapUrl(url)
    }
  }, [address, apiKey])

  if (!address || !apiKey) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg`}>
        <p className="text-gray-500">Keine Adresse verfügbar</p>
      </div>
    )
  }

  return (
    <iframe
      src={mapUrl}
      className={`${className} border-0 rounded-lg`}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`Karte für ${address}`}
    />
  )
}

// Also export as default for compatibility
export default GoogleMaps
