import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"

export async function POST() {
  await connectDB()
  const email = "admin@example.com"
  const password = "Admin123!"
  const existing = await User.findOne({ email })
  if (existing) return NextResponse.json({ created: false, email, note: "Already exists" })
  const passwordHash = await bcrypt.hash(password, 10)
  const u = await User.create({ email, role: "admin", passwordHash, name: "Admin" })
  return NextResponse.json({ created: true, email: u.email, password })
}
