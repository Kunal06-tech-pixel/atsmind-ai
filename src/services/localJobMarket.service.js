const cleanString = (value) => String(value || "").trim();

const roleFamilies = [
  {
    match: /(frontend|front-end|react|ui|web)/i,
    title: "Frontend Developer",
    skills: ["React", "JavaScript", "TypeScript", "HTML", "CSS"],
    description:
      "Build responsive user interfaces, integrate APIs, improve frontend performance, and collaborate with product and design teams.",
  },
  {
    match: /(backend|back-end|node|api|server)/i,
    title: "Backend Developer",
    skills: ["Node.js", "Express", "MongoDB", "REST API", "Authentication"],
    description:
      "Design API services, build secure backend workflows, optimize database access, and maintain production application reliability.",
  },
  {
    match: /(full.?stack|mern|software developer|software engineer)/i,
    title: "Full Stack Software Developer",
    skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript"],
    description:
      "Develop end-to-end product features across frontend and backend, integrate services, debug production issues, and ship maintainable software.",
  },
  {
    match: /(data|analyst|analytics|bi)/i,
    title: "Data Analyst",
    skills: ["SQL", "Python", "Excel", "Dashboard", "Data Analysis"],
    description:
      "Analyze business data, build dashboards, define reporting metrics, and communicate insights to stakeholders.",
  },
  {
    match: /(product|pm|manager)/i,
    title: "Product Manager",
    skills: ["Roadmap", "User Research", "Requirements", "Analytics", "Stakeholder Management"],
    description:
      "Own product discovery, prioritize roadmaps, define requirements, analyze product metrics, and coordinate cross-functional delivery.",
  },
];

const defaultFamily = roleFamilies[2];

const resolveFamily = (role) =>
  roleFamilies.find((family) => family.match.test(role)) || defaultFamily;

const buildJob = ({ family, role, location, index }) => {
  const title = index === 0 ? role || family.title : `${family.title} ${index + 1}`;
  const companyNames = ["Northstar Labs", "Clearpath Systems", "VectorWorks", "BrightLayer"];
  const workModes = ["Hybrid", "Remote", "On-site", "Flexible"];

  return {
    source: "Local fallback",
    id: `local-${index + 1}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title,
    company: companyNames[index % companyNames.length],
    location: cleanString(location) || workModes[index % workModes.length],
    description: `${family.description} Common requirements include ${family.skills.join(", ")}.`,
    url: "",
    createdAt: new Date().toISOString(),
    category: "Generated job template",
    contractType: "permanent",
    contractTime: "full_time",
    salary: {
      min: null,
      max: null,
      isPredicted: false,
    },
  };
};

export const createLocalJobMarket = ({
  role = "",
  location = "",
  country = "in",
  count = 8,
} = {}) => {
  const cleanedRole = cleanString(role);
  const family = resolveFamily(cleanedRole);
  const jobs = Array.from({ length: count }, (_, index) =>
    buildJob({
      family,
      role: index === 0 ? cleanedRole : `${cleanedRole || family.title}`,
      location,
      index,
    })
  );

  return {
    source: "Local fallback",
    count: jobs.length,
    page: 1,
    country: cleanString(country).toLowerCase() || "in",
    resultsPerPage: jobs.length,
    jobs,
    note:
      "Adzuna is not configured, so these are local role templates ranked against your resume. Add ADZUNA_APP_ID and ADZUNA_APP_KEY for live postings.",
  };
};

