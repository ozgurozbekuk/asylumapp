import { getPlanPolicy, getUserPlan } from "../services/planService.js";

export const resolveUserPlan = async (req, res, next) => {
  try {
    const userId = req?.auth?.userId;
    const plan = userId ? await getUserPlan(userId) : "free";
    req.userPlan = plan;
    req.planPolicy = getPlanPolicy(plan);
    return next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Plan resolution error:", error?.message || error);
    return res.status(500).json({ message: "Failed to resolve user plan" });
  }
};

export const requirePlanFeature = (feature, message = "This feature is not available on your current plan.") => {
  return (req, res, next) => {
    const planPolicy = req.planPolicy || getPlanPolicy(req.userPlan || "free");
    if (!planPolicy?.features?.[feature]) {
      return res.status(403).json({ message });
    }
    return next();
  };
};

