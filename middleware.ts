import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/database.types"

const PUBLIC_PATHS = ["/login", "/register", "/auth/callback"] // Pfade, die ohne Login erreichbar sind
const ADMIN_PATHS = ["/admin"] // Pfade, die nur für Admins sind

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
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

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user

  const { pathname } = request.nextUrl

  // Wenn nicht eingeloggt und nicht auf einer öffentlichen Seite -> zum Login
  if (!user && !PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Wenn eingeloggt und auf Login/Register -> zum Dashboard
  if (user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Admin-Routen-Schutz
  if (user && ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || profile.role !== "admin") {
      // Nicht-Admin versucht auf Admin-Seite zuzugreifen
      // Optional: Auf eine "Zugriff verweigert"-Seite umleiten oder zum Dashboard
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
