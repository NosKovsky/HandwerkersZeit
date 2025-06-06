import { getGoogleMapsEmbedUrl } from "@/lib/google-maps-server"

interface GoogleMapsServerProps {
  address?: string
  className?: string
}

export async function GoogleMapsServer({ address, className = "w-full h-64" }: GoogleMapsServerProps) {
  if (!address) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg`}>
        <p className="text-gray-500">Keine Adresse verfügbar</p>
      </div>
    )
  }

  const mapUrl = await getGoogleMapsEmbedUrl(address)

  if (!mapUrl) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg`}>
        <p className="text-gray-500">Google Maps nicht verfügbar</p>
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
