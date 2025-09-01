import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { dbConnect } from "@/lib/db"
import { UserModel } from "@/models/user"
import { TestAttemptModel } from "@/models/question"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await dbConnect()

  const students = await UserModel.aggregate([
    { $match: { role: "student" } },
    { $project: { email: 1, name: 1, completedCount: { $size: "$completedChapters" } } },
    { $sort: { completedCount: -1 } },
    { $limit: 20 },
  ])

  const questionAttempts = await TestAttemptModel.aggregate([
    { $unwind: "$attempts" },
    {
      $group: {
        _id: "$attempts.questionId",
        attempts: { $sum: 1 },
        correct: { $sum: { $cond: ["$attempts.isCorrect", 1, 0] } },
      },
    },
    { $sort: { attempts: -1 } },
    { $limit: 20 },
  ])

  const recentTests = await TestAttemptModel.find({}, { score: 1, total: 1, userId: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  return NextResponse.json({ students, questionAttempts, recentTests })
}
