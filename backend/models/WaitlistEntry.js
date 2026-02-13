import mongoose from "mongoose";

const WaitlistEntrySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    plan: {
      type: String,
      default: "pro",
      trim: true,
    },
  },
  { timestamps: true },
);

WaitlistEntrySchema.index({ email: 1, plan: 1 }, { unique: true });

export const WaitlistEntry =
  mongoose.models.WaitlistEntry || mongoose.model("WaitlistEntry", WaitlistEntrySchema);

