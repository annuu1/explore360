import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"
import bcrypt from "bcryptjs"

async function requireAdmin(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
  return token && token.role === "admin"
}

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await connectDB()
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean()
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { email, name, password, role } = await req.json()
  if (!email || !password) return NextResponse.json({ error: "email and password required" }, { status: 400 })
  await connectDB()
  const exists = await User.findOne({ email: String(email).toLowerCase() })
  if (exists) return NextResponse.json({ error: "User exists" }, { status: 409 })
  const passwordHash = await bcrypt.hash(String(password), 10)
  const doc = await User.create({
    email: String(email).toLowerCase(),
    name: name || "",
    passwordHash,
    role: role === "admin" ? "admin" : "student",
    active: true,
  })
  return NextResponse.json({ id: doc._id.toString() }, { status: 201 })
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id, active } = await req.json()
  if (!id || typeof active !== "boolean") return NextResponse.json({ error: "id and active required" }, { status: 400 })
  await connectDB()
  await User.updateOne({ _id: id }, { $set: { active } })
  return NextResponse.json({ ok: true })
}
