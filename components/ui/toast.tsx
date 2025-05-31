"use client"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  onDismiss: (id: string) => void
}

export function Toast({ id, title, description, variant = "default", onDismiss }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-lg border p-4 shadow-lg",
        variant === "destructive" ? "border-red-200 bg-red-50 text-red-900" : "border-gray-200 bg-white text-gray-900",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && <div className="font-medium">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onDismiss(id)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
