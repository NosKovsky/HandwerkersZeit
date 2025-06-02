import { type NextRequest, NextResponse } from "next/server"

// Middleware komplett deaktiviert für Deployment
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
