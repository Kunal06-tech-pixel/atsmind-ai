export const SCORE_WEIGHTS = {
  skills: 0.45,
  semantic: 0.3,
  keywords: 0.15,
  quality: 0.1,
};

const clampScore = (score) =>
  Math.max(0, Math.min(100, Math.round(Number(score) || 0)));

export const calculateFinalAtsScore = ({
  hasJobDescription,
  skillScore,
  semanticScore,
  keywordScore,
  resumeQualityScore,
}) => {
  if (!hasJobDescription) {
    return clampScore(resumeQualityScore);
  }

  return clampScore(
    skillScore * SCORE_WEIGHTS.skills +
      semanticScore * SCORE_WEIGHTS.semantic +
      keywordScore * SCORE_WEIGHTS.keywords +
      resumeQualityScore * SCORE_WEIGHTS.quality
  );
};

