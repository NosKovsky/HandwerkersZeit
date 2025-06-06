// Client-side geocoding utility
export async function geocodeAddress(address: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`,
    )
    const data = await response.json()

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return { lat: location.lat, lng: location.lng }
    }
    return null
  } catch (error) {
    console.error("Error geocoding address:", error)
    return null
  }
}

// Client-side function to get static map URL
export function getStaticMapUrl(
  lat: number,
  lng: number,
  zoom = 15,
  width = 600,
  height = 300,
  apiKey: string,
): string {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${apiKey}`
}

// Check if Google Maps API key is available (client-side version)
export function hasGoogleMapsApiKey(): boolean {
  // In client-side, we can't directly access environment variables
  // This function should be called with the API key passed from server
  return true // This will be handled by the calling component
}

// Get Google Maps search URL
export function getGoogleMapsSearchUrl(address: string): string {
  const encodedAddress = encodeURIComponent(address)
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
}

// Get Google Maps embed URL (client-side version)
export function getGoogleMapsEmbedUrl(address: string, apiKey: string): string | null {
  if (!apiKey || !address) {
    return null
  }

  const encodedAddress = encodeURIComponent(address)
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}&maptype=satellite`
}
