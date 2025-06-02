import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

// Statische Assets und API-Routen ausschließen
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}

export async function middleware(request: NextRequest) {
  try {
    // Statische Ressourcen überspringen
    const { pathname } = request.nextUrl
    if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.startsWith("/public")) {
      return NextResponse.next()
    }

    // Öffentliche Routen, die ohne Authentifizierung zugänglich sind
    const publicRoutes = ["/login", "/register", "/"]
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // Supabase-Client erstellen
    const supabase = createSupabaseServerClient()

    // Session mit Timeout-Schutz abrufen
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Session timeout")), 2000))

    const { data } = (await Promise.race([
      sessionPromise,
      timeoutPromise.then(() => ({ data: { session: null } })),
    ])) as { data: { session: any } }

    // Wenn keine Session vorhanden ist, zur Login-Seite umleiten
    if (!data.session) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Wenn alles in Ordnung ist, weiter zur angeforderten Seite
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware-Fehler:", error)

    // Bei einem Fehler zur Login-Seite umleiten
    const { pathname } = request.nextUrl
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", pathname)
    redirectUrl.searchParams.set("error", "session_error")
    return NextResponse.redirect(redirectUrl)
  }
}
