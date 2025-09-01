import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { dbConnect } from "@/lib/db"
import { UserModel } from "@/models/user"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: "student" | "admin"
      email: string
      name?: string | null
    } & DefaultSession["user"]
  }
  interface User {
    role: "student" | "admin"
  }
}

export const authOptions = {
  session: { strategy: "jwt" as const },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        await dbConnect()
        const user = await UserModel.findOne({ email: credentials.email }).lean()
        if (!user) return null
        const ok = await compare(credentials.password, user.passwordHash)
        if (!ok) return null
        return { id: String(user._id), email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.uid = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          id: token.uid,
          email: session.user?.email || "",
          name: session.user?.name,
          role: token.role,
        }
      }
      return session
    },
  },
}

export const { handlers: authHandlers, signIn, signOut, auth } = NextAuth(authOptions as any)
