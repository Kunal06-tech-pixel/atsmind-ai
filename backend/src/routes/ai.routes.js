import express from "express";
import { improveSection } from "../controllers/ai.controller.js";
import protect from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/auth.middleware.js";
import { requireCsrf } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("job_seeker", "recruiter", "admin"));

router.post("/improve", requireCsrf, improveSection);

export default router;
