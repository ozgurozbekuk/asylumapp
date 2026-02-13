import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      default: "user",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    citations: [
      {
        url: { type: String },
        title: { type: String },
        source: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
