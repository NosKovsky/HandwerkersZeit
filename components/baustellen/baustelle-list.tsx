import type { Baustelle } from "@/app/baustellen/actions"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface BaustellenListProps {
  baustellen: Baustelle[]
}

const BaustellenList = ({ baustellen }: BaustellenListProps) => {
  if (!baustellen || baustellen.length === 0) {
    return <p>Keine Baustellen gefunden.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {baustellen.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <CardDescription className="text-xs">
              {item.address && <p>{item.address}</p>}
              <p>
                Status:{" "}
                <span
                  className={cn(
                    "font-medium",
                    item.status === "Aktiv" && "text-green-600",
                    item.status === "In Arbeit" && "text-yellow-600",
                    item.status === "Abgeschlossen" && "text-gray-500",
                  )}
                >
                  {item.status || "Unbekannt"}
                </span>
              </p>
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href={`/baustellen/${item.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Details Anzeigen
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default BaustellenList
