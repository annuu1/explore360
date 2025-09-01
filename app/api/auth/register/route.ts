import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { UserModel } from "@/models/user"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password, name, role } = body || {}
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }
  await dbConnect()
  const exists = await UserModel.findOne({ email })
  if (exists) return NextResponse.json({ error: "User already exists" }, { status: 409 })

  const passwordHash = await hash(password, 10)
  const user = await UserModel.create({
    email,
    passwordHash,
    name: name || "",
    role: role === "admin" ? "admin" : "student",
  })
  return NextResponse.json({ id: user._id, email: user.email, role: user.role })
}
