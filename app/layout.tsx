import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider" // Annahme: Sie haben eine ThemeProvider Komponente
import { Toaster } from "@/components/ui/toaster" // Für Benachrichtigungen

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Baustellendokumentation",
  description: "Digitale Dokumentation für Baustellen",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
