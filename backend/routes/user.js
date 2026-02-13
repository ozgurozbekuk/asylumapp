import express from "express";
import { UserProfile } from "../models/UserProfile.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

// Get or create the signed-in user's profile (Clerk handles auth).
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;

    const profile =
      (await UserProfile.findOne({ userId }).lean()) ||
      (await UserProfile.create({ userId, plan: "free" })).toObject();

    res.json({ profile });
  }),
);

// Update plan or basic profile details selected during Clerk sign-up.
router.patch(
  "/plan",
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;
    const { plan } = req.body || {};
    if (!plan || !["free", "plus", "pro"].includes(plan)) {
      return res.status(400).json({ message: "Plan must be 'free', 'plus' or 'pro'" });
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { plan } },
      { upsert: true, new: true },
    ).lean();

    res.json({ profile });
  }),
);

// Sync optional Clerk metadata (email/name/etc.).
router.post(
  "/sync",
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;
    const { email, name, plan, metadata } = req.body || {};

    const updates = {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
      ...(metadata ? { metadata } : {}),
    };

    if (plan && ["free", "plus", "pro"].includes(plan)) {
      updates.plan = plan;
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { upsert: true, new: true },
    ).lean();

    res.json({ profile });
  }),
);

export default router;
