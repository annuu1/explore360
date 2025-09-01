import { Schema, models, model } from "mongoose"

const CompletedChapterSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, index: true },
    name: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student", index: true },

    classId: { type: Schema.Types.ObjectId, ref: "Class" },
    subjectIds: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
    completedChapters: [CompletedChapterSchema],
  },
  { timestamps: true },
)

export const UserModel = models.User || model("User", UserSchema)
export { UserModel as User }

export default UserModel
