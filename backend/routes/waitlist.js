import express from "express";
import { z } from "zod";
import { WaitlistEntry } from "../models/WaitlistEntry.js";

const router = express.Router();

const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  plan: z.string().trim().max(32).optional(),
});

router.post("/", async (req, res) => {
  try {
    const parseResult = waitlistSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid email address", issues: parseResult.error.issues });
    }

    const { email, plan = "pro" } = parseResult.data;

    await WaitlistEntry.findOneAndUpdate(
      { email, plan },
      { $setOnInsert: { email, plan } },
      { upsert: true, new: true },
    );

    return res.status(201).json({ message: "You have been added to the waitlist." });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Waitlist error:", err);
    return res.status(500).json({ message: "Failed to add to waitlist" });
  }
});

export default router;

