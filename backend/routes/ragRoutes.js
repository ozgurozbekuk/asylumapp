import express from "express";
import { z } from "zod";
import { answerAsylumQuestion } from "../services/ragService.js";

const router = express.Router();

const askSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  sector: z.string().trim().max(64).optional(),
  sourceFilter: z.string().trim().max(64).optional(),
});

// POST /api/chat/ask
router.post(
  "/ask",
  async (req, res) => {
    try {
      const parseResult = askSchema.safeParse(req.body || {});
      if (!parseResult.success) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid request body", issues: parseResult.error.issues });
      }

      const { question, sector, sourceFilter } = parseResult.data;
      const sectorToUse = sector || "uk-asylum";

      const result = await answerAsylumQuestion(question, { sector: sectorToUse, sourceFilter });

      return res.json({
        success: true,
        answer: result.answer,
        contextUsed: result.contextUsed,
        citations: result.citations || [],
        safetyFlags: result.safetyFlags || [],
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error in /api/chat/ask:", err);
      return res.status(500).json({
        success: false,
        error: "Unexpected error while answering the question",
      });
    }
  },
);

export default router;
