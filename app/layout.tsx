import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AppSessionProvider } from "@/components/session-provider"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import "./globals.css"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AppSessionProvider>
            <header className="w-full border-b bg-background/80 supports-[backdrop-filter]:backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
                <Link href="/" className="font-semibold">
                  Study App
                </Link>
                <nav className="flex items-center gap-2 overflow-x-auto">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/test">Test</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/profile">Profile</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/analytics">Analytics</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/upload">Admin</Link>
                  </Button>
                </nav>
              </div>
            </header>
            <main className="min-h-dvh">{children}</main>
          </AppSessionProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
