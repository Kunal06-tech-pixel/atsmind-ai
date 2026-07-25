import { PDFParse } from "pdf-parse";

import { analyzeResumeAgainstJob } from "./sharedAnalysis.service.js";

export const parseResumePdf = async (fileBuffer) => {
  const parser = new PDFParse({ data: fileBuffer });
  const result = await parser.getText();
  return result.text;
};

export const runAnalysisPipeline = async ({
  resumeText,
  jobDescription,
  jobTitle,
}) =>
  analyzeResumeAgainstJob({
    resumeText,
    jobDescription,
    jobTitle,
    options: {
      includeSuggestions: true,
    },
  });
