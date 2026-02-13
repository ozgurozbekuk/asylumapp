import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    plan: {
      type: String,
      enum: ["free", "plus", "pro"],
      default: "free",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

export const UserProfile =
  mongoose.models.UserProfile || mongoose.model("UserProfile", UserProfileSchema);
