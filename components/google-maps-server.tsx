interface GoogleMapsServerProps {
  address?: string
  className?: string
}

export function GoogleMapsServer({ address, className = "w-full h-64" }: GoogleMapsServerProps) {
  if (!address) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg`}>
        <p className="text-gray-500">Keine Adresse verfügbar</p>
      </div>
    )
  }

  // Simple fallback without API - just show the address
  return (
    <div className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg p-4`}>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Adresse:</p>
        <p className="font-medium">{address}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
        >
          In Google Maps öffnen
        </a>
      </div>
    </div>
  )
}
