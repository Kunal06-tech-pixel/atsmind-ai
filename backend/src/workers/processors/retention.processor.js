import Analysis from "../../models/Analysis.js";
import CandidateResume from "../../models/CandidateResume.js";
import { deleteResumeFile } from "../../services/storage.service.js";
import { logger } from "../../utils/logger.js";

const daysToMs = (days) => days * 24 * 60 * 60 * 1000;

export const enforceResumeRetention = async () => {
  const retentionDays = Number(process.env.RESUME_FILE_RETENTION_DAYS || 90);
  const cutoff = new Date(Date.now() - daysToMs(retentionDays));

  const analyses = await Analysis.find({
    $or: [
      { filePath: { $exists: true, $ne: "" } },
      { s3Key: { $exists: true, $ne: "" } },
    ],
    createdAt: { $lt: cutoff },
  })
    .select("filePath storageProvider s3Key")
    .limit(500);

  let deletedFiles = 0;

  for (const analysis of analyses) {
    await deleteResumeFile({
      storageProvider: analysis.storageProvider,
      s3Key: analysis.s3Key,
      filePath: analysis.filePath,
    }).then(
      (deleted) => {
        if (!deleted) return;
        deletedFiles += 1;
      },
      () => {}
    );

    await analysis.updateOne({ filePath: "", s3Key: "" });
  }

  const candidateResumes = await CandidateResume.find({
    $or: [
      { filePath: { $exists: true, $ne: "" } },
      { s3Key: { $exists: true, $ne: "" } },
    ],
    createdAt: { $lt: cutoff },
  })
    .select("filePath storageProvider s3Key")
    .limit(500);

  let deletedCandidateFiles = 0;

  for (const candidateResume of candidateResumes) {
    await deleteResumeFile({
      storageProvider: candidateResume.storageProvider,
      s3Key: candidateResume.s3Key,
      filePath: candidateResume.filePath,
    }).then(
      (deleted) => {
        if (!deleted) return;
        deletedCandidateFiles += 1;
      },
      () => {}
    );

    await candidateResume.updateOne({ filePath: "", s3Key: "" });
  }

  logger.info(
    {
      retentionDays,
      scannedAnalyses: analyses.length,
      scannedCandidates: candidateResumes.length,
      deletedFiles,
      deletedCandidateFiles,
    },
    "Resume file retention cleanup completed"
  );

  return {
    retentionDays,
    scanned: analyses.length,
    scannedCandidates: candidateResumes.length,
    deletedFiles,
    deletedCandidateFiles,
  };
};
