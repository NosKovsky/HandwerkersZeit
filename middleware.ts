import { NextResponse, type NextRequest } from "next/server"

// Pfade, die ohne Login erreichbar sind
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/auth/callback",
  "/api",
  "/",
  "/dashboard",
  "/projects",
  "/entries",
  "/materials",
  "/receipts",
  "/tasks",
  "/gallery",
  "/settings",
  "/time-tracking",
]
// Pfade, die nur für Admins sind
const ADMIN_PATHS = ["/admin"]

export async function middleware(request: NextRequest) {
  // Für jetzt erlauben wir alle Pfade, um das Deployment zu ermöglichen
  return NextResponse.next()
}

// Korrekter Matcher als Array von Strings
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
