import { PDFParse } from "pdf-parse";

import { logger } from "../utils/logger.js";
import { aiGateway } from "./aiGateway.service.js";
import {
  analyzeResumeLocally,
  buildFallbackSuggestions,
} from "./localAnalysis.service.js";

export const parseResumePdf = async (fileBuffer) => {
  const parser = new PDFParse({ data: fileBuffer });
  const result = await parser.getText();
  return result.text;
};

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

export const runAnalysisPipeline = async ({
  resumeText,
  jobDescription,
  jobTitle,
}) => {
  const localResult = await analyzeResumeLocally({
    resumeText,
    jobDescription,
    jobTitle,
  });
  const analysis = await addSuggestions({
    resumeText,
    jobDescription,
    jobTitle,
    analysis: localResult.analysis,
  });

  logger.info(
    {
      semanticScore: analysis.semanticScore,
      skillScore: analysis.skillScore,
      keywordScore: analysis.keywordScore,
      resumeQualityScore: analysis.resumeQualityScore,
      atsScore: analysis.atsScore.score,
      suggestionSource: analysis.suggestionSource,
    },
    "Resume analysis pipeline completed"
  );

  return { ...localResult, analysis };
};
