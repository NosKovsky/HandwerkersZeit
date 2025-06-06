"use server"

// Move the API key access to individual functions to avoid module-level exposure
async function getApiKey(): Promise<string | undefined> {
  return process.env.GOOGLE_MAPS_API_KEY
}

export async function getGoogleMapsEmbedUrl(address: string): Promise<string | null> {
  const apiKey = await getApiKey()

  if (!apiKey || !address) {
    return null
  }

  const encodedAddress = encodeURIComponent(address)
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}&maptype=satellite`
}

export async function getGoogleMapsSearchUrl(address: string): Promise<string> {
  const encodedAddress = encodeURIComponent(address)
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
}

export async function hasGoogleMapsApiKey(): Promise<boolean> {
  const apiKey = await getApiKey()
  return !!apiKey
}
