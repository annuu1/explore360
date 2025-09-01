import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { dbConnect } from "@/lib/db"
import { UserModel } from "@/models/user"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { subjectId, chapterId, completed } = await req.json()
  if (!subjectId || !chapterId || typeof completed !== "boolean")
    return NextResponse.json({ error: "subjectId, chapterId, completed required" }, { status: 400 })
  await dbConnect()

  if (completed) {
    await UserModel.findByIdAndUpdate(session.user.id, {
      $addToSet: { completedChapters: { subjectId, chapterId, completedAt: new Date() } },
    })
  } else {
    await UserModel.findByIdAndUpdate(session.user.id, {
      $pull: { completedChapters: { subjectId, chapterId } },
    })
  }

  return NextResponse.json({ ok: true })
}
