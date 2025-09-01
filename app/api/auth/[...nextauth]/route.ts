// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authHandlers } from "@/lib/auth"   // fine here — route runs in Node

export const { GET, POST } = authHandlers
