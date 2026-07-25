import express from "express";
import path from "path";
import multer from "multer";

import {
  compareCandidateEvaluations,
  createJobOpening,
  deleteJobOpening,
  getCandidateEvaluation,
  getCandidateProgress,
  getCandidateRankings,
  getJobOpening,
  listCandidateEvaluations,
  listCandidateResumes,
  listJobOpenings,
  updateJobOpening,
  updateEvaluationNotes,
  updateEvaluationStatus,
  uploadCandidateResumes,
} from "../controllers/recruiter.controller.js";
import protect from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/auth.middleware.js";
import { requireCsrf } from "../middleware/csrf.middleware.js";

const router = express.Router();
const storage = multer.memoryStorage();
const maxFileSize = Number(process.env.CANDIDATE_RESUME_MAX_BYTES || 10 * 1024 * 1024);
const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
    files: Number(process.env.CANDIDATE_BATCH_MAX_FILES || 20),
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isPdf = file.mimetype === "application/pdf" || extension === ".pdf";

    if (!isPdf) {
      return cb(new Error("Only PDF resumes are supported"));
    }

    return cb(null, true);
  },
});

const uploadCandidateFiles = (req, res, next) => {
  upload.array("resumes")(req, res, (error) => {
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
router.use(authorizeRoles("recruiter"));

router
  .route("/jobs")
  .get(listJobOpenings)
  .post(requireCsrf, createJobOpening);

router
  .route("/jobs/:jobId")
  .get(getJobOpening)
  .patch(requireCsrf, updateJobOpening)
  .delete(requireCsrf, deleteJobOpening);

router
  .route("/jobs/:jobId/candidates")
  .get(listCandidateResumes)
  .post(requireCsrf, uploadCandidateFiles, uploadCandidateResumes);

router.get("/jobs/:jobId/progress", getCandidateProgress);
router.get("/jobs/:jobId/evaluations", listCandidateEvaluations);
router.get("/jobs/:jobId/rankings", getCandidateRankings);
router.post("/jobs/:jobId/compare", requireCsrf, compareCandidateEvaluations);

router.get("/evaluations/:evaluationId", getCandidateEvaluation);
router.patch(
  "/evaluations/:evaluationId/status",
  requireCsrf,
  updateEvaluationStatus
);
router.patch(
  "/evaluations/:evaluationId/notes",
  requireCsrf,
  updateEvaluationNotes
);

export default router;
