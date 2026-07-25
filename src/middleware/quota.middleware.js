import Analysis from "../models/Analysis.js";
import User from "../models/User.js";

const PLAN_LIMITS = {
  free: 5,
  pro: 100,
  team: Infinity,
};

const startOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

export const enforceAnalysisQuota = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("plan");

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const plan = user.plan || "free";
    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

    if (!Number.isFinite(limit)) {
      req.userPlan = plan;
      return next();
    }

    const usedThisMonth = await Analysis.countDocuments({
      user: req.userId,
      createdAt: { $gte: startOfMonth() },
      status: { $ne: "failed" },
    });

    if (usedThisMonth >= limit) {
      return res.status(429).json({
        success: false,
        message: "Monthly analysis quota exceeded",
        error: "quota_exceeded",
        limit,
        used: usedThisMonth,
        plan,
      });
    }

    req.userPlan = plan;
    return next();
  } catch (error) {
    console.error("Quota check error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not verify analysis quota",
    });
  }
};

