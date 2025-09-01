import { Schema, models, model } from "mongoose"

const OptionSchema = new Schema(
  {
    key: { type: String, enum: ["A", "B", "C", "D", "E"], required: true },
    text: { type: String, required: true },
  },
  { _id: false },
)

const QuestionSchema = new Schema(
  {
    text: { type: String, required: true },
    options: { type: [OptionSchema], validate: (v: any[]) => v.length >= 2 },
    correctOptionKey: { type: String, enum: ["A", "B", "C", "D", "E"], required: true },

    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true, index: true },

    tags: [{ type: String }],
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  },
  { timestamps: true },
)

const QuestionAttemptSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    selectedOptionKey: { type: String, enum: ["A", "B", "C", "D", "E"], required: true },
    isCorrect: { type: Boolean, required: true },
    timeTakenSec: { type: Number, default: 0 },
  },
  { _id: false },
)

const TestAttemptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },

    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question", required: true }],
    attempts: [QuestionAttemptSchema],

    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const QuestionModel = models.Question || model("Question", QuestionSchema)
export const TestAttemptModel = models.TestAttempt || model("TestAttempt", TestAttemptSchema)
