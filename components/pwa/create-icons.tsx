"use client"
import { createCanvas } from "canvas"
import { saveAs } from "file-saver"
import { Button } from "@/components/ui/button"

// Diese Komponente ist nur für die Entwicklung, um die Icons zu generieren
export function CreateIcons() {
  const generateIcons = () => {
    const sizes = [192, 512]

    sizes.forEach((size) => {
      const canvas = createCanvas(size, size)
      const ctx = canvas.getContext("2d")

      // Hintergrund
      const gradient = ctx.createLinearGradient(0, 0, size, size)
      gradient.addColorStop(0, "#f97316")
      gradient.addColorStop(1, "#3b82f6")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)

      // Icon (vereinfachter Helm)
      ctx.fillStyle = "#ffffff"
      const iconSize = size * 0.6
      const x = (size - iconSize) / 2
      const y = (size - iconSize) / 2

      // Vereinfachter Helm
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, iconSize / 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, iconSize / 2 - size / 10, 0, Math.PI * 2)
      ctx.fill()

      // Als PNG speichern
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `icon-${size}x${size}.png`)
        }
      })
    })
  }

  return (
    <Button onClick={generateIcons} className="hidden">
      Generate Icons
    </Button>
  )
}
