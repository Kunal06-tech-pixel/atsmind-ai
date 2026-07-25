import mongoose from "mongoose";

const candidateResumeSchema = new mongoose.Schema(
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
    candidateName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },
    candidateEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
      maxlength: 240,
    },
    candidatePhone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 260,
    },
    storageProvider: {
      type: String,
      enum: ["local", "s3"],
      default: "local",
    },
    filePath: {
      type: String,
      default: "",
      trim: true,
    },
    s3Key: {
      type: String,
      default: "",
      trim: true,
    },
    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },
    resumeText: {
      type: String,
      default: "",
    },
    consentConfirmed: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: "Candidate consent confirmation is required",
      },
    },
    contentHash: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    processingStatus: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
      index: true,
    },
    errorMessage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

candidateResumeSchema.index({ recruiterId: 1, jobOpeningId: 1, createdAt: -1 });
candidateResumeSchema.index({ jobOpeningId: 1, processingStatus: 1 });
candidateResumeSchema.index(
  { jobOpeningId: 1, contentHash: 1 },
  {
    unique: true,
    partialFilterExpression: {
      contentHash: { $exists: true, $type: "string" },
    },
  }
);

const CandidateResume = mongoose.model("CandidateResume", candidateResumeSchema);

export default CandidateResume;

