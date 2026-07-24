import mongoose from "mongoose";

const atsScoreSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    level: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const skillMatchSchema = new mongoose.Schema(
  {
    requiredSkill: {
      type: String,
      required: true,
      trim: true,
    },
    matchedSkill: {
      type: String,
      default: "",
      trim: true,
    },
    method: {
      type: String,
      enum: ["exact", "semantic", "missing"],
      required: true,
    },
    similarity: {
      type: Number,
      default: 0,
      min: -1,
      max: 1,
    },
  },
  { _id: false }
);

const suggestionFeedbackSchema = new mongoose.Schema(
  {
    suggestionIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    helpful: {
      type: Boolean,
      required: true,
    },
    suggestionSource: {
      type: String,
      default: "",
      trim: true,
    },
    promptVersion: {
      type: String,
      default: "resume-suggestions-v1",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "complete", "failed"],
      default: "complete",
      index: true,
    },

    idempotencyKey: {
      type: String,
      trim: true,
    },

    errorMessage: {
      type: String,
      default: "",
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    filePath: {
      type: String,
      default: "",
      trim: true,
    },

    storageProvider: {
      type: String,
      enum: ["local", "s3"],
      default: "local",
    },

    s3Key: {
      type: String,
      default: "",
      trim: true,
    },

    companyName: {
      type: String,
      default: "",
      trim: true,
    },

    jobTitle: {
      type: String,
      default: "",
      trim: true,
    },

    jobDescription: {
      type: String,
      default: "",
      trim: true,
    },

    summary: {
      type: String,
      default: "",
      trim: true,
    },

    roleMatch: {
      type: String,
      default: "",
      trim: true,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    skillsDetected: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    skillsMatch: {
      type: [String],
      default: [],
    },

    missingKeywords: {
      type: [String],
      default: [],
    },

    experienceAnalysis: {
      type: String,
      default: "",
      trim: true,
    },

    suggestions: {
      type: [String],
      default: [],
    },

    suggestionSource: {
      type: String,
      default: "",
      trim: true,
    },

    suggestionFeedback: {
      type: [suggestionFeedbackSchema],
      default: [],
    },

    atsScore: {
      type: atsScoreSchema,
      default: () => ({}),
    },

    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ================= NLP + EMBEDDING FIELDS =================

    similarity: {
      type: Number,
      default: 0,
    },

    semanticScore: {
      type: Number,
      default: 0,
    },

    skillScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    resumeQualityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    skillMatches: {
      type: [skillMatchSchema],
      default: [],
    },

    scoringMethod: {
      type: String,
      default: "",
      trim: true,
    },

    aiScore: {
      type: Number,
      default: 0,
    },

    keywordScore: {
      type: Number,
      default: 0,
    },

    matchedKeywords: {
      type: [String],
      default: [],
    },

    embeddingModel: {
      type: String,
      default: "all-MiniLM-L6-v2",
    },

    embeddingDimensions: {
      type: Number,
      default: 384,
    },

    // 🔥 VECTOR STORAGE
    embedding: {
      type: [Number],
      default: [],
    },
  },

  { timestamps: true }
);

analysisSchema.index({
  user: 1,
  createdAt: -1,
});

analysisSchema.index(
  { user: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $exists: true, $type: "string" },
    },
  }
);

const Analysis = mongoose.model(
  "Analysis",
  analysisSchema
);

export default Analysis;
