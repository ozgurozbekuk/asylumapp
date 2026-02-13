import express from "express";
import { z } from "zod";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { answerAsylumQuestion } from "../services/ragService.js";
import { getPlanPolicy } from "../services/planService.js";

const router = express.Router();

const sanitizeLanguage = (lang) => (["en", "tr"].includes(lang) ? lang : "en");
const MAX_MESSAGE_LENGTH = 2000;

const startOfTodayUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
};

const createSessionSchema = z.object({
  title: z.string().trim().max(120).optional(),
  language: z.string().optional(),
  initialMessage: z.string().trim().max(MAX_MESSAGE_LENGTH).optional(),
});

const messageSchema = z.object({
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  sourceFilter: z.string().trim().max(64).optional(),
  officialOnly: z.boolean().optional(),
});

// List chat sessions for the signed-in Clerk user.
router.get(
  "/sessions",
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;
    const sessions = await Conversation.find({ userId }).sort({ updatedAt: -1 }).lean();
    res.json({ sessions });
  }),
);

// Create a new chat session.
router.post(
  "/sessions",
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;
    const planPolicy = req.planPolicy || getPlanPolicy(req.userPlan);
    const parseResult = createSessionSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid request body", issues: parseResult.error.issues });
    }

    const newChatsPerDay = planPolicy?.limits?.newChatsPerDay;
    if (typeof newChatsPerDay === "number") {
      const todayStart = startOfTodayUtc();
      const sessionsToday = await Conversation.countDocuments({
        userId,
        createdAt: { $gte: todayStart },
      });
      if (sessionsToday >= newChatsPerDay) {
        return res.status(429).json({
          message:
            `Plan limit reached: you can start up to ${newChatsPerDay} new chats per day.`,
        });
      }
    }

    const { title = "New chat", language = "en", initialMessage } = parseResult.data;

    const conversation = await Conversation.create({
      userId,
      title: (title || "").trim() || "New chat",
      language: sanitizeLanguage(language),
    });

    let assistantMessage = null;
    if (initialMessage && initialMessage.trim()) {
      assistantMessage = await Message.create({
        conversationId: conversation._id,
        userId,
        role: "assistant",
        content: initialMessage.trim(),
      });
    }

    res.status(201).json({ conversation, assistantMessage });
  }),
);

// Get a single session with messages.
router.get(
  "/sessions/:id",
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;
    const { id } = req.params;

    const conversation = await Conversation.findOne({ _id: id, userId }).lean();
    if (!conversation) return res.status(404).json({ message: "Session not found" });

    const messages = await Message.find({ conversationId: id, userId }).sort({ createdAt: 1 }).lean();
    res.json({ conversation, messages });
  }),
);

// Rename or change language on a session.
router.patch(
  "/sessions/:id",
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;
    const { id } = req.params;
    const updates = {};

    if (req.body?.title) updates.title = req.body.title.trim();
    if (req.body?.language) updates.language = sanitizeLanguage(req.body.language);

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates, $currentDate: { updatedAt: true } },
      { new: true },
    ).lean();

    if (!conversation) return res.status(404).json({ message: "Session not found" });
    res.json({ conversation });
  }),
);

// Add a new message and return an assistant reply placeholder.
router.post(
  "/sessions/:id/messages",
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;
    const planPolicy = req.planPolicy || getPlanPolicy(req.userPlan);
    const { id } = req.params;
    const parseResult = messageSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid request body", issues: parseResult.error.issues });
    }

    const { content, sourceFilter, officialOnly } = parseResult.data;

    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) return res.status(404).json({ message: "Session not found" });

    const questionsPerChatPerDay = planPolicy?.limits?.questionsPerChatPerDay;
    if (typeof questionsPerChatPerDay === "number") {
      const todayStart = startOfTodayUtc();
      const questionsToday = await Message.countDocuments({
        conversationId: id,
        userId,
        role: "user",
        createdAt: { $gte: todayStart },
      });
      if (questionsToday >= questionsPerChatPerDay) {
        return res.status(429).json({
          message: `Plan limit reached: ${questionsPerChatPerDay} questions per chat per day.`,
        });
      }
    }

    const userMessage = await Message.create({
      conversationId: id,
      userId,
      role: "user",
      content: content.trim(),
    });

    const resolvedSourceFilter = officialOnly ? "GOV.UK" : sourceFilter;
    const assistantReply = await answerAsylumQuestion(content.trim(), {
      sector: "uk-asylum",
      sourceFilter: resolvedSourceFilter,
      userId,
      conversationId: id,
    });
    const assistantMessage = await Message.create({
      conversationId: id,
      userId,
      role: "assistant",
      content: assistantReply?.answer || "",
      citations: assistantReply?.citations || [],
    });

    if (!conversation.title || ["New chat", "Yeni Sohbet"].includes(conversation.title)) {
      await Conversation.updateOne(
        { _id: id, userId },
        {
          $set: { title: content.trim().slice(0, 48) },
          $currentDate: { updatedAt: true },
        },
      );
    } else {
      await Conversation.updateOne({ _id: id, userId }, { $currentDate: { updatedAt: true } });
    }

    res.status(201).json({ userMessage, assistantMessage, citations: assistantReply?.citations || [] });
  }),
);

// Delete a session and all its messages.
router.delete(
  "/sessions/:id",
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;
    const { id } = req.params;

    const conversation = await Conversation.findOneAndDelete({ _id: id, userId });
    if (!conversation) return res.status(404).json({ message: "Session not found" });

    await Message.deleteMany({ conversationId: id, userId });
    res.json({ message: "Session deleted" });
  }),
);

export default router;
