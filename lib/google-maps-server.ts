// Simplified Google Maps utilities without API key usage

export function hasGoogleMapsApiKey(): boolean {
  return false // Always return false since we're not using the API
}

export function getGoogleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export function getGoogleMapsEmbedUrl(address: string): string | null {
  // Return null since we're not using embed maps
  return null
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  // Return null since we're not using the geocoding API
  return null
}

export function getStaticMapUrl(lat: number, lng: number, zoom = 15): string | null {
  // Return null since we're not using static maps
  return null
}
