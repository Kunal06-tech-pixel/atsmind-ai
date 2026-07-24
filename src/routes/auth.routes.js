import express from "express";
import {
  signup,
  login,
  refresh,
  logout,
} from "../controllers/auth.controller.js";
import {
  getCsrfToken,
  requireCsrf,
} from "../middleware/csrf.middleware.js";
import { authRateLimit } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// 🔐 Auth routes
router.post("/signup", authRateLimit, signup);
router.post("/login", authRateLimit, login);
router.get("/csrf-token", getCsrfToken);
router.post("/refresh", requireCsrf, refresh);
router.post("/logout", requireCsrf, logout);

export default router;
