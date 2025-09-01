import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    role?: "student" | "admin"
  }
  interface Session {
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: "student" | "admin"
      active?: boolean //
    }
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    role?: "student" | "admin"
    active?: boolean //
  }
}
