import fs from "fs/promises";
import crypto from "crypto";
import mongoose from "mongoose";

import Analysis from "../models/Analysis.js";
import { resumeAnalysisQueue } from "../queues/resumeAnalysis.queue.js";
import {
  deleteResumeFile,
  saveResumeFile,
} from "../services/storage.service.js";
import { captureEvent } from "../services/analytics.service.js";
import { findSimilarEmbeddings } from "../services/vectorStore.service.js";

const isPdfBuffer = (buffer) =>
  buffer.subarray(0, 5).toString("utf8") === "%PDF-";

const validatePdfBuffer = (buffer) => isPdfBuffer(buffer);

const createIdempotencyKey = ({ userId, fileBuffer, jobDescription, jobTitle }) => {
  const resumeHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  return crypto
    .createHash("sha256")
    .update(`${userId}:${resumeHash}:${jobTitle || ""}:${jobDescription || ""}`)
    .digest("hex");
};

export const serializeAnalysis = (analysis) => {
  const doc = typeof analysis.toObject === "function" ? analysis.toObject() : analysis;
  const id = doc._id?.toString?.() || doc.id;
  const atsScore = doc.atsScore || { score: 0, level: "" };

  return {
    id,
    status: doc.status || "complete",
    errorMessage: doc.errorMessage || "",
    fileName: doc.fileName,
    companyName: doc.companyName,
    jobTitle: doc.jobTitle,
    jobDescription: doc.jobDescription,
    summary: doc.summary,
    roleMatch: doc.roleMatch,
    strengths: doc.strengths || [],
    weaknesses: doc.weaknesses || [],
    skillsDetected: doc.skillsDetected || [],
    missingSkills: doc.missingSkills || [],
    skillsMatch: doc.skillsMatch || [],
    missingKeywords: doc.missingKeywords || [],
    matchedKeywords: doc.matchedKeywords || [],
    skillMatches: doc.skillMatches || [],
    experienceAnalysis: doc.experienceAnalysis,
    suggestions: doc.suggestions || [],
    suggestionSource: doc.suggestionSource || "",
    atsScore,
    rawPayload: doc.rawPayload || {},
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    similarity: doc.similarity || 0,
    semanticScore: doc.semanticScore || 0,
    skillScore: doc.skillScore || 0,
    keywordScore: doc.keywordScore || 0,
    resumeQualityScore: doc.resumeQualityScore || 0,
    scoringMethod: doc.scoringMethod || "",
    aiScore: doc.aiScore || 0,
    embeddingModel: doc.embeddingModel || "all-MiniLM-L6-v2",
    embeddingDimensions: doc.embeddingDimensions || 384,
    algorithm: "Cosine similarity with embedding-assisted skill matching",

    // Backward-compatible response keys.
    role_match: doc.roleMatch,
    skills_detected: doc.skillsDetected || [],
    missing_skills: doc.missingSkills || [],
    skills_match: doc.skillsMatch || [],
    missing_keywords: doc.missingKeywords || [],
    experience_analysis: doc.experienceAnalysis,
    ats_score: atsScore,
  };
};

export const analyzeResume = async (req, res) => {
  let storedFile = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume",
      });
    }

    const fileBuffer = req.file.buffer || await fs.readFile(req.file.path);

    if (!validatePdfBuffer(fileBuffer)) {
      return res.status(400).json({
        success: false,
        message: "File is not a valid PDF",
      });
    }

    const companyName = req.body.companyName || "";
    const jobTitle = req.body.jobTitle || "";
    const jobDescription = req.body.jobDescription || "";

    const idempotencyKey = createIdempotencyKey({
      userId: req.userId,
      fileBuffer,
      jobDescription,
      jobTitle,
    });

    const existingAnalysis = await Analysis.findOne({
      user: req.userId,
      idempotencyKey,
    });

    if (existingAnalysis) {
      return res.status(200).json({
        success: true,
        analysisId: existingAnalysis._id,
        status: existingAnalysis.status,
        analysis: serializeAnalysis(existingAnalysis),
      });
    }

    storedFile = await saveResumeFile({
      userId: req.userId,
      originalName: req.file.originalname,
      buffer: fileBuffer,
    });

    const analysis = await Analysis.create({
      user: req.userId,
      fileName: req.file.originalname,
      filePath: storedFile.filePath,
      storageProvider: storedFile.storageProvider,
      s3Key: storedFile.s3Key,
      companyName,
      jobTitle,
      jobDescription,
      idempotencyKey,
      status: "pending",
    });

    try {
      await resumeAnalysisQueue.add(
        "analyze",
        { analysisId: analysis._id.toString() },
        { jobId: idempotencyKey }
      );
    } catch (error) {
      await analysis.updateOne({
        status: "failed",
        errorMessage: "Could not enqueue analysis job",
      });
      throw error;
    }

    captureEvent(req.userId, "resume_uploaded", {
      analysisId: analysis._id.toString(),
      hasJobDescription: Boolean(jobDescription),
      storageProvider: analysis.storageProvider,
    });

    storedFile = null;

    return res.status(202).json({
      success: true,
      analysisId: analysis._id,
      status: analysis.status,
      analysis: serializeAnalysis(analysis),
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return res.status(500).json({
      success: false,
      message: "Resume analysis failed",
    });
  } finally {
    if (storedFile?.filePath) {
      await fs.unlink(storedFile.filePath).catch(() => {});
    }

    if (storedFile?.storageProvider === "s3") {
      await deleteResumeFile(storedFile).catch(() => {});
    }

    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
  }
};

export const listAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,
      total: analyses.length,
      analyses: analyses.map(serializeAnalysis),
    });
  } catch (error) {
    console.error("List analyses error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load analyses",
    });
  }
};

export const getAnalysisById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.userId,
    }).lean();

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.json({
      success: true,
      analysis: serializeAnalysis(analysis),
    });
  } catch (error) {
    console.error("Get analysis error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load analysis",
    });
  }
};

export const getAnalysisStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.userId,
    }).lean();

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.json({
      success: true,
      analysisId: analysis._id,
      status: analysis.status || "complete",
      analysis: analysis.status === "complete" ? serializeAnalysis(analysis) : null,
      errorMessage: analysis.errorMessage || "",
    });
  } catch (error) {
    console.error("Get analysis status error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load analysis status",
    });
  }
};

export const getSimilarAnalyses = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.userId,
      status: "complete",
    }).lean();

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    const matches = await findSimilarEmbeddings({
      userId: req.userId,
      embedding: analysis.embedding,
      limit: Math.min(Number(req.query.limit || 10), 25),
    });

    return res.json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error("Get similar analyses error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load similar analyses",
    });
  }
};

export const recordSuggestionFeedback = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    const suggestionIndex = Number(req.params.suggestionIndex);
    const { helpful } = req.body;

    if (!Number.isInteger(suggestionIndex) || typeof helpful !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "suggestionIndex and helpful boolean are required",
      });
    }

    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    if (suggestionIndex >= analysis.suggestions.length) {
      return res.status(400).json({
        success: false,
        message: "Suggestion index is out of range",
      });
    }

    analysis.suggestionFeedback.push({
      suggestionIndex,
      helpful,
      suggestionSource: analysis.suggestionSource,
      promptVersion: "resume-suggestions-v1",
    });
    await analysis.save();

    captureEvent(req.userId, "suggestion_feedback", {
      analysisId: analysis._id.toString(),
      suggestionIndex,
      helpful,
      suggestionSource: analysis.suggestionSource,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Suggestion feedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not save suggestion feedback",
    });
  }
};

export const analyzeResumeText = async (req, res) => {
  try {
    const { resumeText, jobDescription = "", jobTitle = "" } = req.body;

    if (!String(resumeText || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    const { runAnalysisPipeline } = await import(
      "../services/resumeAnalysisPipeline.service.js"
    );
    const { resumeEmbedding, analysis } = await runAnalysisPipeline({
      resumeText,
      jobDescription,
      jobTitle,
    });

    return res.json({
      success: true,
      analysis: serializeAnalysis({
        ...analysis,
        jobTitle,
        jobDescription,
        aiScore: 0,
        embeddingModel: "all-MiniLM-L6-v2",
        embeddingDimensions: resumeEmbedding.length,
      }),
    });
  } catch (error) {
    console.error("Analyze text error:", error);
    return res.status(500).json({
      success: false,
      message: "Analysis failed",
    });
  }
};
