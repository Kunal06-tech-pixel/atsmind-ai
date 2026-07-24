const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api";
const DEFAULT_COUNTRY = "in";
const DEFAULT_RESULTS_PER_PAGE = 20;

const cleanString = (value) => String(value || "").trim();

const toPositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const stripHtml = (value) =>
  cleanString(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const toNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getAdzunaConfig = (env = process.env) => ({
  appId: cleanString(env.ADZUNA_APP_ID),
  appKey: cleanString(env.ADZUNA_APP_KEY),
  defaultCountry:
    cleanString(env.ADZUNA_DEFAULT_COUNTRY).toLowerCase() || DEFAULT_COUNTRY,
  resultsPerPage: toPositiveInteger(
    env.ADZUNA_RESULTS_PER_PAGE,
    DEFAULT_RESULTS_PER_PAGE
  ),
});

export const getMissingAdzunaCredentials = (env = process.env) => {
  const config = getAdzunaConfig(env);
  const missing = [];

  if (!config.appId) missing.push("ADZUNA_APP_ID");
  if (!config.appKey) missing.push("ADZUNA_APP_KEY");

  return missing;
};

export const createAdzunaConfigurationError = (env = process.env) => {
  const missing = getMissingAdzunaCredentials(env);
  const error = new Error(
    `Adzuna job recommendations are not configured. Missing: ${missing.join(
      ", "
    )}.`
  );

  error.statusCode = 503;
  error.code = "ADZUNA_CONFIG_MISSING";
  error.missing = missing;
  return error;
};

export const normalizeAdzunaJob = (job) => {
  const area = Array.isArray(job?.location?.area) ? job.location.area : [];
  const location = cleanString(job?.location?.display_name || area.join(", "));
  const salaryMin = toNumberOrNull(job?.salary_min);
  const salaryMax = toNumberOrNull(job?.salary_max);

  return {
    source: "Adzuna",
    id: cleanString(job?.id || job?.slug || job?.redirect_url),
    title: cleanString(job?.title) || "Untitled role",
    company: cleanString(job?.company?.display_name) || "Unknown company",
    location,
    description: stripHtml(job?.description),
    url: cleanString(job?.redirect_url || job?.url),
    createdAt: cleanString(job?.created),
    category: cleanString(job?.category?.label),
    contractType: cleanString(job?.contract_type),
    contractTime: cleanString(job?.contract_time),
    salary: {
      min: salaryMin,
      max: salaryMax,
      isPredicted: Boolean(job?.salary_is_predicted),
    },
  };
};

export const fetchAdzunaJobs = async ({
  role = "",
  location = "",
  country,
  page = 1,
  resultsPerPage,
  env = process.env,
  fetchImpl = globalThis.fetch,
} = {}) => {
  const config = getAdzunaConfig(env);
  const missing = getMissingAdzunaCredentials(env);

  if (missing.length) {
    throw createAdzunaConfigurationError(env);
  }

  if (typeof fetchImpl !== "function") {
    throw new Error("No fetch implementation is available for Adzuna requests.");
  }

  const searchCountry = cleanString(country).toLowerCase() || config.defaultCountry;
  const searchPage = toPositiveInteger(page, 1);
  const searchResultsPerPage = toPositiveInteger(
    resultsPerPage,
    config.resultsPerPage
  );
  const url = new URL(
    `${ADZUNA_BASE_URL}/jobs/${encodeURIComponent(searchCountry)}/search/${searchPage}`
  );

  url.searchParams.set("app_id", config.appId);
  url.searchParams.set("app_key", config.appKey);
  url.searchParams.set("results_per_page", String(searchResultsPerPage));
  url.searchParams.set("content-type", "application/json");

  const cleanedRole = cleanString(role);
  const cleanedLocation = cleanString(location);

  if (cleanedRole) url.searchParams.set("what", cleanedRole);
  if (cleanedLocation) url.searchParams.set("where", cleanedLocation);

  const response = await fetchImpl(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error(`Adzuna job search failed with status ${response.status}.`);
    error.statusCode = 502;
    error.code = "ADZUNA_REQUEST_FAILED";
    throw error;
  }

  const payload = await response.json();
  const jobs = Array.isArray(payload?.results)
    ? payload.results.map(normalizeAdzunaJob).filter((job) => job.id || job.url)
    : [];

  return {
    source: "Adzuna",
    count: Number(payload?.count) || jobs.length,
    page: searchPage,
    country: searchCountry,
    resultsPerPage: searchResultsPerPage,
    jobs,
  };
};
