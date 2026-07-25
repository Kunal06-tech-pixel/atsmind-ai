import express from "express";

import {
  deleteUserData,
  getProfile,
} from "../controllers/user.controller.js";
import protect from "../middleware/auth.middleware.js";
import { requireCsrf } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.delete("/data", protect, requireCsrf, deleteUserData);

export default router;
