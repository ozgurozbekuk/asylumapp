import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New chat",
      trim: true,
    },
    language: {
      type: String,
      default: "en",
      trim: true,
    },
    // Rolling summary for cost‑efficient history
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    // Total message count (user + assistant) that the summary reflects
    summaryMessageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Conversation =
  mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
