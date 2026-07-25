import Analysis from "../../models/Analysis.js";
import {
  parseResumePdf,
  runAnalysisPipeline,
} from "../../services/resumeAnalysisPipeline.service.js";
import { upsertResumeEmbedding } from "../../services/vectorStore.service.js";
import {
  deleteResumeFile,
  readResumeFile,
} from "../../services/storage.service.js";
import { captureEvent } from "../../services/analytics.service.js";
import { captureException } from "../../instrumentation.js";
import { logger } from "../../utils/logger.js";

export const processResumeAnalysis = async (job) => {
  const startedAt = Date.now();
  const { analysisId } = job.data;
  const analysis = await Analysis.findById(analysisId);

  if (!analysis) {
    throw new Error(`Analysis ${analysisId} was not found`);
  }

  if (analysis.status === "complete") {
    return { analysisId, status: "complete" };
  }

  await analysis.updateOne({
    status: "processing",
    errorMessage: "",
  });

  try {
    if (!analysis.filePath && !analysis.s3Key) {
      throw new Error("Analysis has no uploaded file path");
    }

    const fileBuffer = await readResumeFile({
      storageProvider: analysis.storageProvider,
      s3Key: analysis.s3Key,
      filePath: analysis.filePath,
    });
    const resumeText = await parseResumePdf(fileBuffer);

    if (!resumeText?.trim()) {
      throw new Error("Could not read text from this PDF");
    }

    const { resumeEmbedding, analysis: resultAnalysis } = await runAnalysisPipeline({
      resumeText,
      jobDescription: analysis.jobDescription,
      jobTitle: analysis.jobTitle,
    });

    await analysis.updateOne({
      status: "complete",
      aiScore: 0,
      embeddingModel: "all-MiniLM-L6-v2",
      embeddingDimensions: resumeEmbedding.length,
      embedding: resumeEmbedding,
      errorMessage: "",
      ...resultAnalysis,
    });

    await upsertResumeEmbedding({
      analysisId: analysis._id,
      userId: analysis.user,
      embedding: resumeEmbedding,
    }).catch((error) => {
      logger.warn(
        { analysisId, error: error.message },
        "pgvector dual-write failed"
      );
      captureException(error, {
        analysisId,
        operation: "upsertResumeEmbedding",
      });
    });

    captureEvent(analysis.user, "analysis_completed", {
      analysisId,
      score: resultAnalysis.atsScore?.score || 0,
      durationMs: Date.now() - startedAt,
      suggestionSource: resultAnalysis.suggestionSource,
    });

    return { analysisId, status: "complete" };
  } catch (error) {
    await analysis.updateOne({
      status: "failed",
      errorMessage: error.message,
    });
    throw error;
  } finally {
    await deleteResumeFile({
      storageProvider: analysis.storageProvider,
      s3Key: analysis.s3Key,
      filePath: analysis.filePath,
    }).catch(() => {});
  }
};
