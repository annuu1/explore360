import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { QuestionModel } from "@/models/question"
import { auth } from "@/lib/auth"

type IncomingQuestion = {
  text: string
  options: { key: "A" | "B" | "C" | "D" | "E"; text: string }[]
  correctOptionKey: "A" | "B" | "C" | "D" | "E"
  classId: string
  subjectId: string
  chapterId: string
  tags?: string[]
  difficulty?: "easy" | "medium" | "hard"
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const payload = (await req.json()) as IncomingQuestion[] | { questions: IncomingQuestion[] }
  const list = Array.isArray(payload) ? payload : payload?.questions
  if (!Array.isArray(list) || list.length === 0) {
    return NextResponse.json({ error: "Provide an array of questions" }, { status: 400 })
  }
  await dbConnect()

  const docs = list.map((q) => ({
    text: q.text,
    options: q.options,
    correctOptionKey: q.correctOptionKey,
    classId: q.classId,
    subjectId: q.subjectId,
    chapterId: q.chapterId,
    tags: q.tags || [],
    difficulty: q.difficulty || "medium",
  }))

  const result = await QuestionModel.insertMany(docs, { ordered: false })
  return NextResponse.json({ inserted: result.length })
}
