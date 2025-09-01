import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { dbConnect } from "@/lib/db"
import { QuestionModel, TestAttemptModel } from "@/models/question"
import { Types } from "mongoose"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const testId = params.id
  const {
    answers,
  }: { answers: { questionId: string; selectedOptionKey: "A" | "B" | "C" | "D" | "E"; timeTakenSec?: number }[] } =
    await req.json()
  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "answers required" }, { status: 400 })
  }

  await dbConnect()
  const test = await TestAttemptModel.findById(testId)
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 })
  if (String(test.userId) !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const ids = answers.map((a) => new Types.ObjectId(a.questionId))
  const map = new Map<string, { correctOptionKey: string }>()
  const qs = await QuestionModel.find({ _id: { $in: ids } }, { correctOptionKey: 1 }).lean()
  qs.forEach((q) => map.set(String(q._id), { correctOptionKey: q.correctOptionKey }))

  let score = 0
  const attempts = answers.map((a) => {
    const correct = map.get(a.questionId)?.correctOptionKey
    const isCorrect = a.selectedOptionKey === correct
    if (isCorrect) score += 1
    return {
      questionId: a.questionId,
      selectedOptionKey: a.selectedOptionKey,
      isCorrect,
      timeTakenSec: a.timeTakenSec || 0,
    }
  })

  test.attempts = attempts as any
  test.score = score
  test.submittedAt = new Date()
  await test.save()

  return NextResponse.json({ score, total: test.total })
}
