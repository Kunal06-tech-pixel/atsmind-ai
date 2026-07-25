import mongoose from "mongoose";

const scoreBreakdownSchema = new mongoose.Schema(
  {
    skillMatch: { type: Number, default: 0, min: 0, max: 100 },
    semanticSimilarity: { type: Number, default: 0, min: 0, max: 100 },
    keywordCoverage: { type: Number, default: 0, min: 0, max: 100 },
    resumeQuality: { type: Number, default: 0, min: 0, max: 100 },
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const bestEvidenceSchema = new mongoose.Schema(
  {
    text: { type: String, default: "", trim: true },
    section: { type: String, default: "", trim: true },
    position: { type: Number, default: 0, min: 0 },
    similarityScore: { type: Number, default: 0, min: -1, max: 1 },
  },
  { _id: false }
);

const requirementEvidenceSchema = new mongoose.Schema(
  {
    requirement: { type: String, required: true, trim: true },
    requirementType: { type: String, default: "general", trim: true },
    mandatory: { type: Boolean, default: false },
    bestEvidence: { type: bestEvidenceSchema, default: () => ({}) },
    similarityScore: { type: Number, default: 0, min: -1, max: 1 },
    status: {
      type: String,
      enum: ["strong", "partial", "missing"],
      required: true,
    },
    explanation: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const candidateEvaluationSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobOpeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobOpening",
      required: true,
      index: true,
    },
    candidateResumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateResume",
      required: true,
      unique: true,
      index: true,
    },
    scores: {
      type: scoreBreakdownSchema,
      default: () => ({}),
    },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    requirementEvidence: {
      type: [requirementEvidenceSchema],
      default: [],
    },
    mandatoryRequirementWarnings: {
      type: [String],
      default: [],
    },
    systemRank: {
      type: Number,
      default: null,
      min: 1,
    },
    recruitmentStatus: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "selected"],
      default: "pending",
      index: true,
    },
    recruiterNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 4000,
    },
    recruiterOverrideScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    recruiterSummary: {
      type: String,
      default: "",
      trim: true,
      maxlength: 4000,
    },
    suggestionSource: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

candidateEvaluationSchema.index({
  recruiterId: 1,
  jobOpeningId: 1,
  systemRank: 1,
});
candidateEvaluationSchema.index({
  jobOpeningId: 1,
  "scores.overallScore": -1,
});
candidateEvaluationSchema.index({
  recruiterId: 1,
  recruitmentStatus: 1,
  updatedAt: -1,
});

const CandidateEvaluation = mongoose.model(
  "CandidateEvaluation",
  candidateEvaluationSchema
);

export default CandidateEvaluation;

