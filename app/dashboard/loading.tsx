import { Loader2, Hammer } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Hammer className="h-8 w-8 text-primary animate-bounce" />
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Dashboard wird geladen...</h2>
          <p className="text-muted-foreground">Einen Moment bitte</p>
        </div>
      </div>
    </div>
  )
}
