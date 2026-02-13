import express from "express";
import { UserProfile } from "../models/UserProfile.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();
const PLAN_UPDATE_DISABLED_MESSAGE = "Plan updates are managed by billing/admin only.";

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

// Plan changes must not be client-controlled.
router.patch(
  "/plan",
  asyncHandler(async (req, res) => {
    return res.status(403).json({ message: PLAN_UPDATE_DISABLED_MESSAGE });
  }),
);

// Sync optional Clerk metadata (email/name/etc.).
router.post(
  "/sync",
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;
    const { email, name, metadata } = req.body || {};

    const updates = {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
      ...(metadata ? { metadata } : {}),
    };

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { upsert: true, new: true },
    ).lean();

    res.json({ profile });
  }),
);

export default router;
