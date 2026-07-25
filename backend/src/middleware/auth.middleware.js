import jwt from "jsonwebtoken";

import User from "../models/User.js";

const getToken = (req) => {
  const authorization = req.get("authorization") || "";

  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return req.cookies?.access_token || req.cookies?.token || "";
};

const protect = async (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select("_id name email plan role companyProfile recruiterVerified")
      .lean();

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    req.userId = user._id.toString();
    req.user = {
      id: req.userId,
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan || "free",
      role: user.role || "job_seeker",
      companyProfile: user.companyProfile || {},
      recruiterVerified: Boolean(user.recruiterVerified),
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }

    return next();
  };
};

export default protect;
