import CandidateEvaluation from "../models/CandidateEvaluation.js";

export const getEvidenceCounts = (evaluation) => {
  const evidence = evaluation.requirementEvidence || [];

  return {
    strongEvidenceCount: evidence.filter((entry) => entry.status === "strong").length,
    partialEvidenceCount: evidence.filter((entry) => entry.status === "partial").length,
    missingEvidenceCount: evidence.filter((entry) => entry.status === "missing").length,
  };
};

export const rankEvaluationsForJob = async ({ recruiterId, jobOpeningId }) => {
  const evaluations = await CandidateEvaluation.find({
    recruiterId,
    jobOpeningId,
  })
    .sort({ "scores.overallScore": -1, createdAt: 1 })
    .select("_id scores.overallScore")
    .lean();

  let previousScore = null;
  let previousRank = 0;
  const operations = evaluations.map((evaluation, index) => {
    const score = Math.round(evaluation.scores?.overallScore || 0);
    const rank = previousScore === score ? previousRank : index + 1;

    previousScore = score;
    previousRank = rank;

    return {
      updateOne: {
        filter: { _id: evaluation._id },
        update: { $set: { systemRank: rank } },
      },
    };
  });

  if (operations.length) {
    await CandidateEvaluation.bulkWrite(operations);
  }

  return operations.length;
};

