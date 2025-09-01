import mongoose, { Schema, type Model, type Document, type Types } from "mongoose"

export interface IAttempt extends Document {
  userId: Types.ObjectId
  percent: number
  total: number
  correct: number
  createdAt: Date
  meta?: Record<string, any>
}

const AttemptSchema = new Schema<IAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    percent: { type: Number, required: true },
    total: { type: Number, required: true },
    correct: { type: Number, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export const Attempt: Model<IAttempt> = mongoose.models.Attempt || mongoose.model<IAttempt>("Attempt", AttemptSchema)

export default Attempt
