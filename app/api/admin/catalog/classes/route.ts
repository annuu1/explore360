import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { ClassModel } from "@/models/catalog"
import { auth } from "@/lib/auth"

export async function GET() {
  await dbConnect()
  const items = await ClassModel.find().sort({ name: 1 }).lean()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await dbConnect()
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })
  const created = await ClassModel.create({ name })
  return NextResponse.json(created)
}
