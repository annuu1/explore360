import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { dbConnect } from "@/lib/db"
import { UserModel } from "@/models/user"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await dbConnect()
  const user = await UserModel.findById(session.user.id).lean()
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({
    classId: user.classId || null,
    subjectIds: user.subjectIds || [],
    completedChapters: user.completedChapters || [],
    name: user.name || "",
    email: user.email,
  })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { classId, subjectIds, name } = await req.json()
  await dbConnect()
  const update: any = {}
  if (typeof name === "string") update.name = name
  if (classId) update.classId = classId
  if (Array.isArray(subjectIds)) update.subjectIds = subjectIds
  const user = await UserModel.findByIdAndUpdate(session.user.id, update, { new: true })
  return NextResponse.json({ ok: true, user: { id: user?._id, classId: user?.classId, subjectIds: user?.subjectIds } })
}
