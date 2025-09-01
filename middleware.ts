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

  // ✅ use getToken instead of auth()
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // ✅ token contains user info if you add it in your NextAuth callbacks
  if (pathname.startsWith("/admin") && token.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/test/:path*",
    "/profile/:path*",
    "/api/:path*",
  ],
}
