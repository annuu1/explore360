import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare, hash } from "bcryptjs"
import { dbConnect } from "@/lib/db"
import { UserModel } from "@/models/user"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: "student" | "admin"
      email: string
      name?: string | null
      active: boolean
    } & DefaultSession["user"]
  }
  interface User {
    role: "student" | "admin"
    active: boolean
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

        const adminEmail = "admin@explore360.in"
        const existingAdmin = await UserModel.findOne({ email: adminEmail })
        if (!existingAdmin) {
          await UserModel.create({
            email: adminEmail,
            name: "Admin",
            passwordHash: await hash("admin", 10),
            role: "admin",
            active: true,
          })
        }

        // authenticate user
        const userDoc = await UserModel.findOne({ email: String(credentials.email).toLowerCase() }).lean()
        if (!userDoc) return null
        if (userDoc.active === false) return null
        const ok = await compare(credentials.password, userDoc.passwordHash)
        if (!ok) return null

        return {
          id: String(userDoc._id),
          email: userDoc.email,
          name: userDoc.name,
          role: userDoc.role,
          active: userDoc.active !== false,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.uid = user.id
        token.active = user.active !== false // persist active flag
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
          active: token.active !== false, //
        } as any
      }
      return session
    },
  },
}

export const { handlers: authHandlers, signIn, signOut, auth } = NextAuth(authOptions as any)
