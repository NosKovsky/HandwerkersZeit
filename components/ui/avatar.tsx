import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }

  return (
    <div
      className={cn("relative flex shrink-0 overflow-hidden rounded-full bg-gray-100", sizeClasses[size], className)}
    >
      {src ? (
        <img
          src={src || "/placeholder.svg"}
          alt={alt || name || "Avatar"}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white font-medium">
          {name ? getInitials(name) : "?"}
        </div>
      )}
    </div>
  )
}
