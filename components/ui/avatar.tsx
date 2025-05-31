import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  }

  return (
    <div className={cn("relative flex shrink-0 overflow-hidden rounded-full bg-muted", sizeClasses[size], className)}>
      {src ? (
        <img
          src={src || "/placeholder.svg"}
          alt={alt || name || "Avatar"}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-medium">
          {name ? getInitials(name) : "?"}
        </div>
      )}
    </div>
  )
}
