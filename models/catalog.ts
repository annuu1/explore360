import { Schema, models, model } from "mongoose"

const ClassSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true },
)

const SubjectSchema = new Schema(
  {
    name: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
  },
  { timestamps: true },
)
SubjectSchema.index({ classId: 1, name: 1 }, { unique: true })

const ChapterSchema = new Schema(
  {
    name: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
  },
  { timestamps: true },
)
ChapterSchema.index({ subjectId: 1, name: 1 }, { unique: true })

export const ClassModel = models.Class || model("Class", ClassSchema)
export const SubjectModel = models.Subject || model("Subject", SubjectSchema)
export const ChapterModel = models.Chapter || model("Chapter", ChapterSchema)
