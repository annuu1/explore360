import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const PUBLIC_PATHS = ["/login", "/register", "/api/auth", "/"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // allow public routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // ✅ use getToken instead of auth(); read role/active from top-level JWT claims; allow AUTH_SECRET fallback
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  })

  if (!token) {
    if (pathname.startsWith("/api")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (token.active === false) {
    if (pathname.startsWith("/api")) return NextResponse.json({ error: "Account inactive" }, { status: 403 })
    const url = new URL("/login", req.url)
    url.searchParams.set("inactive", "1")
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  if (pathname.startsWith("/api/admin") && token.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/test/:path*", "/profile/:path*", "/api/:path*"],
}
