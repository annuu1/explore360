import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { SubjectModel } from "@/models/catalog"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const classId = searchParams.get("classId")
  await dbConnect()
  const filter = classId ? { classId } : {}
  const items = await SubjectModel.find(filter).sort({ name: 1 }).lean()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await dbConnect()
  const { name, classId } = await req.json()
  if (!name || !classId) return NextResponse.json({ error: "name and classId required" }, { status: 400 })
  const created = await SubjectModel.create({ name, classId })
  return NextResponse.json(created)
}
