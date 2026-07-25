import { normalizeAnalysis } from "./analysis";

export const BUILDER_OPTIMIZATION_STORAGE_KEY =
  "atsmind.builder.optimizationContext";

export const createDefaultResumeData = () => ({
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
  },
  education: [
    {
      school: "",
      degree: "",
      field: "",
      start: "",
      end: "",
      gpa: "",
    },
  ],
  experience: [
    {
      jobTitle: "",
      company: "",
      start: "",
      end: "",
      responsibilities: "",
    },
  ],
  projects: [
    {
      title: "",
      techStack: "",
      description: "",
      github: "",
      live: "",
    },
  ],
  skills: {
    technical: [],
    soft: [],
    certifications: [],
  },
});

const cleanString = (value) => String(value || "").trim();

const cleanArray = (value) =>
  Array.isArray(value) ? value.map(cleanString).filter(Boolean) : [];

export const analysisToOptimizationContext = (analysisValue) => {
  const analysis = normalizeAnalysis(analysisValue);

  if (!analysis) return null;

  return {
    sourceAnalysisId: analysis.id,
    sourceFileName: analysis.fileName,
    previousScore: analysis.atsScore.score,
    companyName: analysis.companyName,
    jobTitle: analysis.jobTitle,
    jobDescription: analysis.jobDescription,
    summary: analysis.summary,
    strengths: cleanArray(analysis.strengths),
    weaknesses: cleanArray(analysis.weaknesses),
    missingSkills: cleanArray(analysis.missingSkills),
    missingKeywords: cleanArray(analysis.missingKeywords),
    suggestions: cleanArray(analysis.suggestions),
    createdAt: analysis.createdAt,
  };
};

export const readStoredOptimizationContext = () => {
  try {
    const stored = window.sessionStorage.getItem(BUILDER_OPTIMIZATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const storeOptimizationContext = (context) => {
  if (!context) return;
  window.sessionStorage.setItem(
    BUILDER_OPTIMIZATION_STORAGE_KEY,
    JSON.stringify(context)
  );
};

export const clearStoredOptimizationContext = () => {
  window.sessionStorage.removeItem(BUILDER_OPTIMIZATION_STORAGE_KEY);
};

export const mergeUniqueStrings = (items, nextItem) => {
  const cleanedNext = cleanString(nextItem);
  if (!cleanedNext) return items;

  const exists = items.some(
    (item) => cleanString(item).toLowerCase() === cleanedNext.toLowerCase()
  );

  return exists ? items : [...items, cleanedNext];
};

const joinLine = (...parts) => parts.map(cleanString).filter(Boolean).join(" ");

const sectionText = (title, lines) => {
  const content = lines.map(cleanString).filter(Boolean);
  return content.length ? `${title}\n${content.join("\n")}` : "";
};

export const builderDataToResumeText = (data) => {
  const personal = data.personal || {};
  const education = Array.isArray(data.education) ? data.education : [];
  const experience = Array.isArray(data.experience) ? data.experience : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const skills = data.skills || {};
  const certificationNames = Array.isArray(skills.certifications)
    ? skills.certifications
        .map((cert) => (typeof cert === "string" ? cert : cert?.name))
        .map(cleanString)
        .filter(Boolean)
    : [];

  const sections = [
    sectionText("CONTACT", [
      personal.name,
      joinLine(personal.email, personal.phone, personal.location),
      joinLine(personal.linkedin, personal.portfolio),
    ]),
    sectionText(
      "EDUCATION",
      education.map((edu) =>
        joinLine(
          edu.school,
          edu.degree,
          edu.field,
          edu.start && edu.end ? `${edu.start} - ${edu.end}` : edu.end || edu.start,
          edu.gpa ? `GPA: ${edu.gpa}` : ""
        )
      )
    ),
    sectionText(
      "WORK EXPERIENCE",
      experience.flatMap((exp) => [
        joinLine(
          exp.jobTitle,
          exp.company,
          exp.start && exp.end ? `${exp.start} - ${exp.end}` : exp.end || exp.start
        ),
        exp.responsibilities,
      ])
    ),
    sectionText(
      "PROJECTS",
      projects.flatMap((project) => [
        joinLine(project.title, project.techStack ? `Tech: ${project.techStack}` : ""),
        project.description,
        joinLine(project.github, project.live),
      ])
    ),
    sectionText("SKILLS", [
      cleanArray(skills.technical).length
        ? `Technical: ${cleanArray(skills.technical).join(", ")}`
        : "",
      cleanArray(skills.soft).length ? `Soft: ${cleanArray(skills.soft).join(", ")}` : "",
      certificationNames.length ? `Certifications: ${certificationNames.join(", ")}` : "",
    ]),
  ];

  return sections.filter(Boolean).join("\n\n");
};
