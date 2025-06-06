"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Camera, ImageIcon, X, Check, RotateCcw } from "lucide-react"
import { toast } from "sonner"

interface CameraCaptureProps {
  onImageCapture: (file: File) => void
  onImageSelect: (file: File) => void
  title?: string
  description?: string
}

export function CameraCapture({
  onImageCapture,
  onImageSelect,
  title = "Foto aufnehmen",
  description = "Nehmen Sie ein Foto auf oder wählen Sie eines aus der Galerie",
}: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Rückkamera bevorzugen
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      setStream(mediaStream)
      setIsCameraActive(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Camera access error:", error)
      toast.error("Kamera konnte nicht gestartet werden")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Canvas-Größe an Video anpassen
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Video-Frame auf Canvas zeichnen
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Als Data URL speichern
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(imageDataUrl)
    stopCamera()
  }

  const confirmCapture = () => {
    if (!capturedImage || !canvasRef.current) return

    // Data URL zu Blob konvertieren
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" })
          onImageCapture(file)
          resetCapture()
          setIsOpen(false)
          toast.success("Foto erfolgreich aufgenommen!")
        }
      },
      "image/jpeg",
      0.8,
    )
  }

  const resetCapture = () => {
    setCapturedImage(null)
    stopCamera()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageSelect(file)
      setIsOpen(false)
      toast.success("Bild erfolgreich ausgewählt!")
    }
  }

  const handleClose = () => {
    resetCapture()
    setIsOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Camera className="h-4 w-4 mr-2" />
            {title}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!isCameraActive && !capturedImage && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kamera starten */}
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={startCamera}>
                  <CardContent className="p-6 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="font-semibold mb-2">Foto aufnehmen</h3>
                    <p className="text-sm text-gray-600">Kamera verwenden</p>
                  </CardContent>
                </Card>

                {/* Datei auswählen */}
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CardContent className="p-6 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="font-semibold mb-2">Bild auswählen</h3>
                    <p className="text-sm text-gray-600">Aus Galerie wählen</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Kamera-Ansicht */}
            {isCameraActive && !capturedImage && (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 md:h-96 object-cover" />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                    <Button
                      onClick={capturePhoto}
                      className="bg-white text-black hover:bg-gray-100 rounded-full w-16 h-16"
                    >
                      <Camera className="h-8 w-8" />
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="bg-white text-black hover:bg-gray-100 rounded-full w-12 h-12"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Aufgenommenes Bild */}
            {capturedImage && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Aufgenommenes Foto"
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={confirmCapture} className="bg-green-500 hover:bg-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Verwenden
                  </Button>
                  <Button onClick={resetCapture} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Wiederholen
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Versteckter File Input */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  )
}
