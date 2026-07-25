import CandidateEvaluation from "../../models/CandidateEvaluation.js";
import CandidateResume from "../../models/CandidateResume.js";
import JobOpening from "../../models/JobOpening.js";
import { parseResumePdf } from "../../services/resumeAnalysisPipeline.service.js";
import { analyzeResumeAgainstJob } from "../../services/sharedAnalysis.service.js";
import { buildRequirementEvidence } from "../../services/requirementEvidence.service.js";
import { rankEvaluationsForJob } from "../../services/candidateRanking.service.js";
import { readResumeFile } from "../../services/storage.service.js";
import { captureException } from "../../instrumentation.js";
import { logger } from "../../utils/logger.js";

const toScoreBreakdown = (analysis) => ({
  skillMatch: analysis.skillScore || 0,
  semanticSimilarity: analysis.semanticScore || 0,
  keywordCoverage: analysis.keywordScore || 0,
  resumeQuality: analysis.resumeQualityScore || 0,
  overallScore: analysis.atsScore?.score || 0,
});

const buildRecruiterSummary = ({ analysis, missingMandatory }) => {
  const score = analysis.atsScore?.score || 0;
  const warnings = missingMandatory.length
    ? ` Missing mandatory requirements: ${missingMandatory.slice(0, 5).join(", ")}.`
    : "";

  return `Highest system match is based on submitted resume evidence. Overall match is ${score}%. ${analysis.summary || ""}${warnings}`.trim();
};

export const processCandidateEvaluation = async (job) => {
  const { candidateResumeId, recruiterId, jobOpeningId } = job.data;
  const candidate = await CandidateResume.findOne({
    _id: candidateResumeId,
    recruiterId,
    jobOpeningId,
  });

  if (!candidate) {
    throw new Error(`Candidate resume ${candidateResumeId} was not found`);
  }

  await candidate.updateOne({
    processingStatus: "processing",
    errorMessage: "",
  });

  try {
    const jobOpening = await JobOpening.findOne({
      _id: jobOpeningId,
      recruiterId,
    }).lean();

    if (!jobOpening) {
      throw new Error("Job requirement not found");
    }

    const fileBuffer = await readResumeFile({
      storageProvider: candidate.storageProvider,
      s3Key: candidate.s3Key,
      filePath: candidate.filePath,
    });
    const resumeText = candidate.resumeText || (await parseResumePdf(fileBuffer));

    if (!resumeText?.trim()) {
      throw new Error("Could not read text from this PDF");
    }

    const { analysis } = await analyzeResumeAgainstJob({
      resumeText,
      jobDescription: jobOpening.jobDescription,
      jobTitle: jobOpening.title,
      options: {
        includeSuggestions: false,
      },
    });
    const requirementEvidence = await buildRequirementEvidence({
      jobDescription: jobOpening.jobDescription,
      mandatorySkills: jobOpening.mandatorySkills,
      preferredSkills: jobOpening.preferredSkills,
      minimumExperience: jobOpening.minimumExperience,
      minimumQualification: jobOpening.minimumQualification,
      resumeText,
    });
    const missingMandatory = requirementEvidence
      .filter((entry) => entry.mandatory && entry.status === "missing")
      .map((entry) => entry.requirement);

    await CandidateEvaluation.findOneAndUpdate(
      {
        candidateResumeId: candidate._id,
        recruiterId,
        jobOpeningId,
      },
      {
        $set: {
          recruiterId,
          jobOpeningId,
          candidateResumeId: candidate._id,
          scores: toScoreBreakdown(analysis),
          matchedSkills: analysis.skillsMatch || [],
          missingSkills: analysis.missingSkills || [],
          matchedKeywords: analysis.matchedKeywords || [],
          missingKeywords: analysis.missingKeywords || [],
          requirementEvidence,
          mandatoryRequirementWarnings: missingMandatory,
          recruiterSummary: buildRecruiterSummary({
            analysis,
            missingMandatory,
          }),
          suggestionSource: "local-analysis",
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    await candidate.updateOne({
      resumeText,
      processingStatus: "completed",
      errorMessage: "",
    });

    await rankEvaluationsForJob({ recruiterId, jobOpeningId }).catch((error) => {
      logger.warn(
        { jobOpeningId, error: error.message },
        "Candidate rank recalculation failed"
      );
      captureException(error, {
        operation: "rankEvaluationsForJob",
        jobOpeningId,
      });
    });

    return {
      candidateResumeId,
      status: "completed",
    };
  } catch (error) {
    await candidate.updateOne({
      processingStatus: "failed",
      errorMessage: error.message,
    });
    throw error;
  }
};

