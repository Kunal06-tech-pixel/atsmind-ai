const toArray = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      const cleaned = value
        .map((item) => String(item || "").trim())
        .filter(Boolean);

      if (cleaned.length > 0) return cleaned;
    }
  }

  return [];
};

const toScore = (value) => {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const normalizeAnalysis = (analysis) => {
  if (!analysis) return null;

  const raw = analysis.rawPayload || analysis.raw_output || {};
  const atsScore = analysis.atsScore || analysis.ats_score || raw.ats_score || {};
  const skillsDetected = toArray(
    analysis.skillsDetected,
    analysis.skills_detected,
    raw.skills_detected,
    analysis.skillsMatch,
    analysis.skills_match,
    raw.skills_match
  );
  const missingSkills = toArray(
    analysis.missingSkills,
    analysis.missing_skills,
    raw.missing_skills,
    analysis.missingKeywords,
    analysis.missing_keywords,
    raw.missing_keywords
  );

  return {
    id: analysis.id || analysis._id,
    fileName: analysis.fileName || analysis.file_name || "Resume analysis",
    companyName: analysis.companyName || "",
    jobTitle: analysis.jobTitle || "",
    jobDescription: analysis.jobDescription || "",
    summary: analysis.summary || raw.summary || "No summary available.",
    roleMatch: analysis.roleMatch || analysis.role_match || raw.role_match || "",
    strengths: toArray(analysis.strengths, raw.strengths),
    weaknesses: toArray(analysis.weaknesses, raw.weaknesses),
    skillsDetected,
    missingSkills,
    skillsMatch: toArray(analysis.skillsMatch, analysis.skills_match, raw.skills_match, skillsDetected),
    missingKeywords: toArray(
      analysis.missingKeywords,
      analysis.missing_keywords,
      raw.missing_keywords,
      missingSkills
    ),
    experienceAnalysis:
      analysis.experienceAnalysis ||
      analysis.experience_analysis ||
      raw.experience_analysis ||
      analysis.experience_years ||
      raw.experience_years ||
      "No experience analysis available.",
    suggestions: toArray(analysis.suggestions, raw.suggestions),
    atsScore: {
      score: toScore(atsScore.score),
      level: atsScore.level || "",
    },
    semanticScore: toScore(analysis.semanticScore),
    skillScore: toScore(analysis.skillScore),
    keywordScore: toScore(analysis.keywordScore),
    resumeQualityScore: toScore(analysis.resumeQualityScore),
    scoringMethod: analysis.scoringMethod || "",
    skillMatches: Array.isArray(analysis.skillMatches) ? analysis.skillMatches : [],
    suggestionSource: analysis.suggestionSource || "",
    createdAt: analysis.createdAt,
    updatedAt: analysis.updatedAt,
  };
};

export const scoreColor = (score) => {
  if (score >= 71) return "#18c8a8";
  if (score >= 41) return "#f2a51a";
  return "#ef4444";
};

export const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;

  return date.toLocaleDateString();
};

export const formatDateTime = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const compactFileName = (fileName) => {
  if (!fileName) return "resume.pdf";
  return fileName.length > 44 ? `${fileName.slice(0, 32)}...${fileName.slice(-8)}` : fileName;
};
