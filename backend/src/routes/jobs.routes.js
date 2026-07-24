import express from "express";

import { getJobRecommendations } from "../controllers/jobs.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/recommendations", getJobRecommendations);

export default router;
