import { UserProfile } from "../models/UserProfile.js";

export const PLAN_POLICIES = {
  free: {
    features: {
      documentUpload: false,
    },
    limits: {
      newChatsPerDay: 2,
      questionsPerChatPerDay: 6,
    },
  },
  plus: {
    features: {
      documentUpload: true,
    },
    limits: {
      newChatsPerDay: null,
      questionsPerChatPerDay: null,
    },
  },
  pro: {
    features: {
      documentUpload: true,
    },
    limits: {
      newChatsPerDay: null,
      questionsPerChatPerDay: null,
    },
  },
};

export const normalizePlan = (plan) => {
  if (!plan) return "free";
  const normalized = String(plan).toLowerCase().trim();
  if (["free", "plus", "pro"].includes(normalized)) return normalized;
  return "free";
};

export const getPlanPolicy = (plan) => {
  const normalized = normalizePlan(plan);
  return PLAN_POLICIES[normalized] || PLAN_POLICIES.free;
};

export const getUserPlan = async (userId) => {
  const profile = await UserProfile.findOne({ userId }).lean();
  return normalizePlan(profile?.plan);
};

export const canUploadDocuments = (plan) => Boolean(getPlanPolicy(plan)?.features?.documentUpload);
