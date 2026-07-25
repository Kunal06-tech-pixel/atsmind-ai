import { logger } from "../utils/logger.js";
import { aiGateway } from "./aiGateway.service.js";
import {
  analyzeResumeLocally,
  buildFallbackSuggestions,
} from "./localAnalysis.service.js";

const addSuggestions = async ({ resumeText, jobDescription, jobTitle, analysis }) => {
  const result = await aiGateway.generateSuggestions({
    resumeText,
    jobDescription,
    jobTitle,
    analysis,
  });

  if (result?.suggestions?.length) {
    return {
      ...analysis,
      suggestions: result.suggestions,
      suggestionSource: result.source,
    };
  }

  return {
    ...analysis,
    suggestions: buildFallbackSuggestions(analysis),
    suggestionSource: "local-fallback",
  };
};

export const analyzeResumeAgainstJob = async ({
  resumeText,
  jobDescription = "",
  jobTitle = "",
  options = {},
}) => {
  const includeSuggestions = options.includeSuggestions !== false;
  const localResult = await analyzeResumeLocally({
    resumeText,
    jobDescription,
    jobTitle,
  });
  const analysis = includeSuggestions
    ? await addSuggestions({
        resumeText,
        jobDescription,
        jobTitle,
        analysis: localResult.analysis,
      })
    : localResult.analysis;

  logger.info(
    {
      semanticScore: analysis.semanticScore,
      skillScore: analysis.skillScore,
      keywordScore: analysis.keywordScore,
      resumeQualityScore: analysis.resumeQualityScore,
      atsScore: analysis.atsScore.score,
      suggestionSource: analysis.suggestionSource || "not-requested",
    },
    "Shared resume analysis completed"
  );

  return {
    ...localResult,
    analysis,
  };
};

