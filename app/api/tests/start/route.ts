import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { dbConnect } from "@/lib/db"
import { QuestionModel, TestAttemptModel } from "@/models/question"
import { Types } from "mongoose"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { classId, subjectId, chapterId, limit = 10 } = await req.json()
  if (!classId || !subjectId || !chapterId) {
    return NextResponse.json({ error: "classId, subjectId, chapterId required" }, { status: 400 })
  }
  await dbConnect()

  const questions = await QuestionModel.aggregate([
    {
      $match: {
        classId: new Types.ObjectId(classId),
        subjectId: new Types.ObjectId(subjectId),
        chapterId: new Types.ObjectId(chapterId),
      },
    },
    { $sample: { size: Number(limit) } },
    { $project: { text: 1, options: 1 } }, // exclude correctOptionKey
  ])

  const test = await TestAttemptModel.create({
    userId: session.user.id,
    classId,
    subjectId,
    chapterId,
    questionIds: questions.map((q: any) => q._id),
    attempts: [],
    total: questions.length,
  })

  return NextResponse.json({
    testId: String(test._id),
    questions: questions.map((q: any) => ({ id: String(q._id), text: q.text, options: q.options })),
  })
}
