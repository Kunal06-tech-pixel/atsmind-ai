import { cosineSimilarity } from "../utils/cosineSimilarity.js";
import { extractSkills } from "../utils/skillMatcher.js";

const REQUIREMENT_CUES = [
  "ability",
  "able to",
  "build",
  "degree",
  "design",
  "develop",
  "experience",
  "familiar",
  "knowledge",
  "manage",
  "must",
  "preferred",
  "proficiency",
  "required",
  "responsible",
  "should",
  "years",
];

const SECTION_PATTERNS = [
  { section: "summary", pattern: /^(professional\s+)?summary$/i },
  { section: "experience", pattern: /^(work\s+)?experience$/i },
  { section: "projects", pattern: /^projects?$/i },
  { section: "skills", pattern: /^(technical\s+)?skills$/i },
  { section: "education", pattern: /^education$/i },
  { section: "certifications", pattern: /^certifications?$/i },
];

const STOP_WORDS = new Set([
  "and",
  "are",
  "for",
  "from",
  "have",
  "the",
  "this",
  "that",
  "with",
  "will",
  "your",
  "candidate",
  "experience",
  "required",
  "preferred",
  "skills",
]);

const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();

const normalizeRequirementKey = (value) => clean(value).toLowerCase();

const tokenize = (text) =>
  clean(text)
    .toLowerCase()
    .match(/[a-z][a-z0-9+#.-]{2,}/g) || [];

const meaningfulTokenSet = (text) =>
  new Set(tokenize(text).filter((token) => !STOP_WORDS.has(token)));

const keywordOverlap = (left, right) => {
  const leftTokens = meaningfulTokenSet(left);
  const rightTokens = meaningfulTokenSet(right);

  if (!leftTokens.size || !rightTokens.size) return 0;

  let shared = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) shared += 1;
  });

  return shared / leftTokens.size;
};

const splitRequirementText = (jobDescription) => {
  const normalized = String(jobDescription || "")
    .replace(/\r/g, "\n")
    .replace(/[•●▪]/g, "\n-");

  return normalized
    .split(/\n|(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((line) => clean(line.replace(/^[-*]\s*/, "")))
    .filter((line) => line.length >= 8 && line.length <= 260);
};

const inferRequirementType = (text) => {
  const lower = text.toLowerCase();

  if (/degree|qualification|education|bachelor|master|phd/.test(lower)) {
    return "qualification";
  }

  if (/years?|experience|senior|junior/.test(lower)) {
    return "experience";
  }

  if (extractSkills(text).length) {
    return "technical";
  }

  if (/manage|communicate|stakeholder|lead|collaborate/.test(lower)) {
    return "responsibility";
  }

  return "general";
};

const addRequirement = (requirements, seen, entry) => {
  const requirement = clean(entry.requirement);
  const key = normalizeRequirementKey(requirement);

  if (!requirement || seen.has(key)) return;

  seen.add(key);
  requirements.push({
    requirement,
    requirementType: entry.requirementType || inferRequirementType(requirement),
    mandatory: Boolean(entry.mandatory),
  });
};

export const extractJobRequirements = ({
  jobDescription = "",
  mandatorySkills = [],
  preferredSkills = [],
  minimumExperience = 0,
  minimumQualification = "",
}) => {
  const requirements = [];
  const seen = new Set();

  mandatorySkills.forEach((skill) => {
    addRequirement(requirements, seen, {
      requirement: `Experience with ${skill}`,
      requirementType: "technical",
      mandatory: true,
    });
  });

  preferredSkills.forEach((skill) => {
    addRequirement(requirements, seen, {
      requirement: `Experience with ${skill}`,
      requirementType: "technical",
      mandatory: false,
    });
  });

  if (Number(minimumExperience) > 0) {
    addRequirement(requirements, seen, {
      requirement: `At least ${Number(minimumExperience)} years of experience`,
      requirementType: "experience",
      mandatory: true,
    });
  }

  if (minimumQualification) {
    addRequirement(requirements, seen, {
      requirement: minimumQualification,
      requirementType: "qualification",
      mandatory: true,
    });
  }

  splitRequirementText(jobDescription).forEach((line) => {
    const lower = line.toLowerCase();
    const hasCue = REQUIREMENT_CUES.some((cue) => lower.includes(cue));

    if (!hasCue && !extractSkills(line).length) return;

    addRequirement(requirements, seen, {
      requirement: line,
      mandatory: /must|required/.test(lower),
    });
  });

  if (!requirements.length) {
    splitRequirementText(jobDescription)
      .slice(0, 8)
      .forEach((line) =>
        addRequirement(requirements, seen, {
          requirement: line,
          mandatory: false,
        })
      );
  }

  return requirements.slice(0, 40);
};

const getSectionName = (line, fallback) => {
  const normalized = clean(line).replace(/:$/, "");
  const match = SECTION_PATTERNS.find((entry) => entry.pattern.test(normalized));
  return match?.section || fallback;
};

const splitResumeLine = (line) => {
  const cleaned = clean(line.replace(/^[-*]\s*/, ""));

  if (cleaned.length <= 260) return [cleaned];

  return cleaned
    .split(/(?<=[.!?])\s+/)
    .map(clean)
    .filter(Boolean);
};

export const segmentResumeEvidence = (resumeText) => {
  const lines = String(resumeText || "")
    .replace(/\r/g, "\n")
    .split("\n");
  const segments = [];
  let section = "general";
  let position = 0;

  lines.forEach((line) => {
    const trimmed = clean(line);

    if (!trimmed) return;

    const nextSection = getSectionName(trimmed, section);
    if (nextSection !== section && nextSection !== "general") {
      section = nextSection;
      return;
    }

    splitResumeLine(trimmed).forEach((text) => {
      if (text.length < 8 || text.length > 420) return;

      segments.push({
        text,
        section,
        position,
      });
      position += 1;
    });
  });

  return segments.slice(0, 160);
};

const hasJavaConflict = (requirement, evidence) => {
  const req = clean(requirement).toLowerCase();
  const ev = clean(evidence).toLowerCase();

  return /\bjava\b/.test(req) && !/\bjava\b/.test(ev) && /\bjavascript\b/.test(ev);
};

const passesLexicalVerification = (requirement, evidence) => {
  if (!evidence) return false;
  if (hasJavaConflict(requirement, evidence)) return false;

  const requirementSkills = extractSkills(requirement).map((entry) => entry.name);
  const evidenceSkills = new Set(extractSkills(evidence).map((entry) => entry.name));

  if (requirementSkills.length) {
    return requirementSkills.some((skill) => evidenceSkills.has(skill));
  }

  return keywordOverlap(requirement, evidence) >= 0.12;
};

export const classifyEvidence = ({
  similarityScore,
  lexicalVerified,
  strongThreshold = Number(process.env.EVIDENCE_STRONG_THRESHOLD || 0.75),
  partialThreshold = Number(process.env.EVIDENCE_PARTIAL_THRESHOLD || 0.55),
}) => {
  if (similarityScore >= strongThreshold && lexicalVerified) return "strong";
  if (similarityScore >= partialThreshold && lexicalVerified) return "partial";
  if (similarityScore >= strongThreshold) return "partial";
  return "missing";
};

const buildExplanation = ({ status, evidence }) => {
  if (status === "missing") {
    return "No reliable supporting resume evidence was retrieved.";
  }

  if (status === "strong") {
    return `The retrieved resume text directly supports the requirement: ${evidence}`;
  }

  return `The retrieved resume text is related but should be reviewed manually: ${evidence}`;
};

export const buildRequirementEvidence = async ({
  jobDescription = "",
  mandatorySkills = [],
  preferredSkills = [],
  minimumExperience = 0,
  minimumQualification = "",
  resumeText = "",
}) => {
  const requirements = extractJobRequirements({
    jobDescription,
    mandatorySkills,
    preferredSkills,
    minimumExperience,
    minimumQualification,
  });
  const segments = segmentResumeEvidence(resumeText);

  if (!requirements.length) return [];

  if (!segments.length) {
    return requirements.map((requirement) => ({
      ...requirement,
      bestEvidence: {
        text: "",
        section: "",
        position: 0,
        similarityScore: 0,
      },
      similarityScore: 0,
      status: "missing",
      explanation: "No resume evidence units were available.",
    }));
  }

  const { generateEmbeddings } = await import("../utils/embedding.js");
  const requirementTexts = requirements.map((entry) => entry.requirement);
  const segmentTexts = segments.map((entry) => entry.text);
  const embeddings = await generateEmbeddings([...requirementTexts, ...segmentTexts]);
  const requirementEmbeddings = embeddings.slice(0, requirementTexts.length);
  const segmentEmbeddings = embeddings.slice(requirementTexts.length);

  return requirements.map((requirement, requirementIndex) => {
    let best = null;

    segments.forEach((segment, segmentIndex) => {
      const similarityScore = cosineSimilarity(
        requirementEmbeddings[requirementIndex],
        segmentEmbeddings[segmentIndex]
      );

      if (!best || similarityScore > best.similarityScore) {
        best = {
          ...segment,
          similarityScore: Number(similarityScore.toFixed(4)),
        };
      }
    });

    const lexicalVerified = passesLexicalVerification(
      requirement.requirement,
      best?.text || ""
    );
    const status = classifyEvidence({
      similarityScore: best?.similarityScore || 0,
      lexicalVerified,
    });
    const bestEvidence =
      status === "missing"
        ? {
            text: "",
            section: "",
            position: 0,
            similarityScore: best?.similarityScore || 0,
          }
        : best;

    return {
      ...requirement,
      bestEvidence,
      similarityScore: best?.similarityScore || 0,
      status,
      explanation: buildExplanation({
        status,
        evidence: bestEvidence.text,
      }),
    };
  });
};
