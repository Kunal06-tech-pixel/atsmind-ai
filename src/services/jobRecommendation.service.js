import { cosineSimilarity } from "../utils/cosineSimilarity.js";
import { extractSkills } from "../utils/skillMatcher.js";

const SCORE_WEIGHTS = {
  skills: 0.5,
  semantic: 0.4,
  quality: 0.1,
};

const SCORING_METHOD =
  "50% skill overlap + 40% semantic similarity + 10% resume quality";

const cleanString = (value) => String(value || "").trim();

const clampScore = (score) =>
  Math.max(0, Math.min(100, Math.round(Number(score) || 0)));

const uniqueStrings = (items) => {
  const seen = new Set();

  return (Array.isArray(items) ? items : [])
    .map(cleanString)
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const normalizeSkillSet = (items) =>
  new Set(uniqueStrings(items).map((item) => item.toLowerCase()));

const buildJobText = (job) =>
  [job?.title, job?.company, job?.description].map(cleanString).filter(Boolean).join("\n");

const loadDefaultEmbeddingGenerator = async () => {
  const { generateEmbeddings } = await import("../utils/embedding.js");
  return generateEmbeddings;
};

export const createJobRecommendation = ({
  analysis,
  job,
  jobEmbedding = [],
}) => {
  const resumeSkills = uniqueStrings([
    ...(analysis?.skillsDetected || []),
    ...(analysis?.skillsMatch || []),
  ]);
  const resumeSkillSet = normalizeSkillSet(resumeSkills);
  const jobSkills = uniqueStrings(
    extractSkills(buildJobText(job)).map((entry) => entry.name)
  );
  const matchedSkills = jobSkills.filter((skill) =>
    resumeSkillSet.has(skill.toLowerCase())
  );
  const missingSkills = jobSkills.filter(
    (skill) => !resumeSkillSet.has(skill.toLowerCase())
  );
  const skillOverlapScore = jobSkills.length
    ? clampScore((matchedSkills.length / jobSkills.length) * 100)
    : 0;
  const semanticScore =
    Array.isArray(analysis?.embedding) &&
    analysis.embedding.length > 0 &&
    Array.isArray(jobEmbedding) &&
    jobEmbedding.length > 0
      ? clampScore(Math.max(0, cosineSimilarity(analysis.embedding, jobEmbedding)) * 100)
      : 0;
  const resumeQualityScore = clampScore(analysis?.resumeQualityScore);
  const jobFitScore = clampScore(
    skillOverlapScore * SCORE_WEIGHTS.skills +
      semanticScore * SCORE_WEIGHTS.semantic +
      resumeQualityScore * SCORE_WEIGHTS.quality
  );
  const explanation = jobSkills.length
    ? `Matched ${matchedSkills.length} of ${jobSkills.length} detected job skills; semantic similarity is ${semanticScore}% based on available posting text.`
    : `No catalog skills were detected in the posting text; semantic similarity is ${semanticScore}% based on available posting text.`;

  return {
    ...job,
    jobFitScore,
    skillOverlapScore,
    semanticScore,
    resumeQualityScore,
    matchedSkills,
    missingSkills,
    detectedJobSkills: jobSkills,
    explanation,
    scoringMethod: SCORING_METHOD,
  };
};

export const rankJobRecommendations = async ({
  analysis,
  jobs,
  generateEmbeddingsFn,
}) => {
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const shouldGenerateEmbeddings =
    Array.isArray(analysis?.embedding) && analysis.embedding.length > 0 && safeJobs.length > 0;
  let embeddings = safeJobs.map(() => []);

  if (shouldGenerateEmbeddings) {
    const embeddingFn = generateEmbeddingsFn || (await loadDefaultEmbeddingGenerator());
    embeddings = await embeddingFn(safeJobs.map(buildJobText));
  }

  const recommendations = safeJobs
    .map((job, index) =>
      createJobRecommendation({
        analysis,
        job,
        jobEmbedding: embeddings[index] || [],
      })
    )
    .sort((left, right) => {
      const scoreDifference = right.jobFitScore - left.jobFitScore;
      if (scoreDifference) return scoreDifference;

      const semanticDifference = right.semanticScore - left.semanticScore;
      if (semanticDifference) return semanticDifference;

      return left.title.localeCompare(right.title);
    });

  return {
    recommendations,
    scoringMethod: SCORING_METHOD,
    note: "Recommendation scores are based on available job posting text from Adzuna.",
  };
};
