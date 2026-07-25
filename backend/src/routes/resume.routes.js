import express from "express";
import path from "path";
import multer from "multer";
import {
  analyzeResume,
  analyzeResumeText,
  getAnalysisStatus,
  getSimilarAnalyses,
  getAnalysisById,
  listAnalyses,
  recordSuggestionFeedback,
} from "../controllers/resume.controller.js";
import protect from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/auth.middleware.js";
import { requireCsrf } from "../middleware/csrf.middleware.js";
import { enforceAnalysisQuota } from "../middleware/quota.middleware.js";
import { resumeUploadRateLimit } from "../middleware/rateLimit.middleware.js";

const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const isPdf = file.mimetype === "application/pdf" || extension === ".pdf";

    if (!isPdf) {
      return cb(new Error("Only PDF resumes are supported"));
    }

    return cb(null, true);
  },
});

const uploadResume = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return next();
  });
};

router.use(protect);
router.use(authorizeRoles("job_seeker", "admin"));

router.get("/analyses", listAnalyses);
router.get("/analyses/:id/status", getAnalysisStatus);
router.get("/analyses/:id/similar", getSimilarAnalyses);
router.get("/analyses/:id", getAnalysisById);
router.post(
  "/analyses/:id/suggestions/:suggestionIndex/feedback",
  requireCsrf,
  recordSuggestionFeedback
);
router.post(
  "/upload",
  resumeUploadRateLimit,
  enforceAnalysisQuota,
  uploadResume,
  analyzeResume
);
router.post(
  "/analyze-text",
  resumeUploadRateLimit,
  enforceAnalysisQuota,
  analyzeResumeText
);

export default router;
