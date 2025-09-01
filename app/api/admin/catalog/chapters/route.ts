import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { ChapterModel } from "@/models/catalog"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get("subjectId")
  await dbConnect()
  const filter = subjectId ? { subjectId } : {}
  const items = await ChapterModel.find(filter).sort({ name: 1 }).lean()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await dbConnect()
  const { name, subjectId } = await req.json()
  if (!name || !subjectId) return NextResponse.json({ error: "name and subjectId required" }, { status: 400 })
  const created = await ChapterModel.create({ name, subjectId })
  return NextResponse.json(created)
}
