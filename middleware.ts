import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/database.types"

// Pfade, die ohne Login erreichbar sind
const PUBLIC_PATHS = ["/login", "/register", "/auth/callback", "/api", "/"]
// Pfade, die nur für Admins sind
const ADMIN_PATHS = ["/admin"]

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const { pathname } = request.nextUrl

    // Statische Ressourcen überspringen
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon.ico") ||
      pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
    ) {
      return response
    }

    // Öffentliche Pfade überspringen
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      return response
    }

    // Supabase-Client erstellen
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
          set: (name, value, options) => response.cookies.set(name, value, options),
          remove: (name, options) => response.cookies.delete(name, options),
        },
      },
    )

    // Session abrufen - korrekte Methode verwenden
    const { data } = await supabase.auth.getSession()
    const session = data.session

    // Wenn keine Session vorhanden ist, zur Login-Seite umleiten
    if (!session) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Admin-Routen-Schutz
    if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
      try {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        if (!profile || profile.role !== "admin") {
          return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url))
        }
      } catch (error) {
        console.error("Fehler beim Prüfen der Admin-Rechte:", error)
        return NextResponse.redirect(new URL("/dashboard?error=admin_check_failed", request.url))
      }
    }

    return response
  } catch (error) {
    console.error("Middleware-Fehler:", error)

    // Bei einem Fehler zur Login-Seite umleiten, außer bei öffentlichen Pfaden
    const { pathname } = request.nextUrl
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL("/login?error=middleware_failed", request.url))
  }
}

// Korrekter Matcher als Array von Strings
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
