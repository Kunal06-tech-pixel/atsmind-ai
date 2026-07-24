import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import AppShell from "../components/ui/AppShell";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import ScoreRing from "../components/ScoreRing";
import api from "../services/axios";
import { compactFileName, normalizeAnalysis } from "../utils/analysis";

const countryOptions = [
  { label: "India", value: "in", currency: "INR", locale: "en-IN" },
  { label: "United States", value: "us", currency: "USD", locale: "en-US" },
  { label: "United Kingdom", value: "gb", currency: "GBP", locale: "en-GB" },
  { label: "Canada", value: "ca", currency: "CAD", locale: "en-CA" },
  { label: "Australia", value: "au", currency: "AUD", locale: "en-AU" },
];

const scoreBadgeClass = (score) => {
  if (score >= 75) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 45) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-700";
};

const cleanArray = (items) =>
  Array.isArray(items)
    ? items.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

const formatSalary = (salary, country) => {
  const min = Number(salary?.min);
  const max = Number(salary?.max);
  const hasMin = Number.isFinite(min) && min > 0;
  const hasMax = Number.isFinite(max) && max > 0;

  if (!hasMin && !hasMax) return "Salary not listed";

  const option =
    countryOptions.find((item) => item.value === country) || countryOptions[0];
  const formatter = new Intl.NumberFormat(option.locale, {
    style: "currency",
    currency: option.currency,
    maximumFractionDigits: 0,
  });

  if (hasMin && hasMax) return `${formatter.format(min)} - ${formatter.format(max)}`;
  return hasMin ? `From ${formatter.format(min)}` : `Up to ${formatter.format(max)}`;
};

const createJobOptimizationContext = ({ analysis, job }) => {
  const missingSkills = cleanArray(job.missingSkills);
  const suggestions = [
    missingSkills.length
      ? `Add truthful project or work evidence for: ${missingSkills.slice(0, 5).join(", ")}.`
      : "",
    "Mirror accurate wording from this job posting in your summary and experience bullets.",
    "Open the live posting and confirm responsibilities before applying.",
  ].filter(Boolean);

  return {
    sourceAnalysisId: analysis.id,
    sourceFileName: analysis.fileName,
    previousScore: analysis.atsScore.score,
    companyName: job.company,
    jobTitle: job.title,
    jobDescription: [
      job.title,
      job.company,
      job.location,
      job.description,
      job.url ? `Apply: ${job.url}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    summary: `Recommended job fit: ${job.jobFitScore}%. ${job.explanation}`,
    strengths: cleanArray(job.matchedSkills).map(
      (skill) => `${skill} is already supported by this resume.`
    ),
    weaknesses: missingSkills.map(
      (skill) => `${skill} appears in this job posting but not in the resume analysis.`
    ),
    missingSkills,
    missingKeywords: [],
    suggestions,
    createdAt: new Date().toISOString(),
  };
};

const SkillList = ({ title, items, tone }) => {
  const safeItems = cleanArray(items);
  const isPositive = tone === "positive";
  const Icon = isPositive ? CheckCircle2 : XCircle;

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
        <Icon
          size={15}
          className={isPositive ? "text-emerald-600" : "text-red-600"}
        />
        {title}
      </p>
      {safeItems.length ? (
        <div className="flex flex-wrap gap-2">
          {safeItems.slice(0, 8).map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                isPositive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          {isPositive
            ? "No direct skill matches were detected."
            : "No missing catalog skills were detected."}
        </p>
      )}
    </div>
  );
};

const JobCard = ({ job, country, analysis, onImprove }) => (
  <article className="liquid-glass liquid-hover rounded-2xl p-5">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <div className="flex gap-4 lg:w-72 lg:shrink-0">
        <ScoreRing score={job.jobFitScore || 0} size={70} strokeWidth={6} label="Fit" />
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${scoreBadgeClass(
              job.jobFitScore || 0
            )}`}
          >
            {job.jobFitScore || 0}% job fit
          </span>
          <p className="mt-2 text-sm text-slate-500">
            Semantic {job.semanticScore || 0}% / Skills {job.skillOverlapScore || 0}%
          </p>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {job.title}
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={15} />
                {job.company}
              </span>
              {job.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} />
                  {job.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Briefcase size={15} />
                {formatSalary(job.salary, country)}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
          {job.description || "Adzuna did not include a detailed description snippet."}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-500">{job.explanation}</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <SkillList title="Matched skills" items={job.matchedSkills} tone="positive" />
          <SkillList title="Skill gaps" items={job.missingSkills} tone="negative" />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <PrimaryButton onClick={() => onImprove(job, analysis)}>
            <Sparkles size={16} />
            Improve resume for this job
          </PrimaryButton>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/45 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white/75 hover:text-slate-950"
            >
              Open job
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  </article>
);

const Jobs = () => {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const initialAnalysisId = currentLocation.state?.analysisId || "";
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(initialAnalysisId);
  const [role, setRole] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [country, setCountry] = useState("in");
  const [jobs, setJobs] = useState([]);
  const [note, setNote] = useState("");
  const [source, setSource] = useState("");
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState("");
  const [missingConfig, setMissingConfig] = useState([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    let active = true;

    const loadAnalyses = async () => {
      setLoadingAnalyses(true);
      setError("");

      try {
        const res = await api.get("/api/resume/analyses");
        if (!active) return;
        setAnalyses(res.data.analyses || []);
      } catch (err) {
        if (!active) return;
        console.error("Load analyses for jobs error:", err);
        setError("Could not load saved resume analyses.");
      } finally {
        if (active) setLoadingAnalyses(false);
      }
    };

    loadAnalyses();

    return () => {
      active = false;
    };
  }, []);

  const normalizedAnalyses = useMemo(
    () => analyses.map(normalizeAnalysis).filter(Boolean),
    [analyses]
  );

  const selectedAnalysis = useMemo(
    () =>
      normalizedAnalyses.find((analysis) => analysis.id === selectedAnalysisId) ||
      normalizedAnalyses[0] ||
      null,
    [normalizedAnalyses, selectedAnalysisId]
  );

  useEffect(() => {
    if (!selectedAnalysis) return;

    if (selectedAnalysis.id !== selectedAnalysisId) {
      setSelectedAnalysisId(selectedAnalysis.id);
    }

    const suggestedRole =
      selectedAnalysis.jobTitle ||
      selectedAnalysis.skillsDetected.slice(0, 3).join(" ") ||
      selectedAnalysis.skillsMatch.slice(0, 3).join(" ");

    setRole(suggestedRole);
  }, [selectedAnalysis, selectedAnalysisId]);

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!selectedAnalysis) {
      setError("Analyze a resume before requesting job recommendations.");
      return;
    }

    if (!role.trim()) {
      setError("Enter a role or choose an analysis with a target role.");
      return;
    }

    setLoadingJobs(true);
    setSearched(true);
    setError("");
    setMissingConfig([]);
    setNote("");
    setSource("");
    setFallback(false);
    setJobs([]);

    try {
      const res = await api.get("/api/jobs/recommendations", {
        params: {
          analysisId: selectedAnalysis.id,
          role: role.trim(),
          location: jobLocation.trim(),
          country,
        },
      });

      setJobs(res.data.jobs || []);
      setNote(res.data.note || "");
      setSource(res.data.source || "");
      setFallback(Boolean(res.data.fallback));
    } catch (err) {
      console.error("Job recommendations error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load job recommendations right now."
      );
      setMissingConfig(err.response?.data?.missing || []);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleImprove = (job, analysis) => {
    navigate("/builder", {
      state: {
        optimizationContext: createJobOptimizationContext({ analysis, job }),
      },
    });
  };

  return (
    <AppShell
      title="Job recommendations"
      description="Rank live job postings against a saved resume analysis."
      actions={
        <SecondaryButton onClick={() => navigate("/analyzer")} className="hidden sm:inline-flex">
          <FileText size={16} />
          New analysis
        </SecondaryButton>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="liquid-glass-strong rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <Briefcase size={14} />
                Real job market
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Recommend roles for this resume.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Select a saved analysis, search a role, and compare job options
                using the same local skills and embedding signals.
              </p>
            </div>
            <span className="liquid-pill rounded-lg px-3 py-2 text-xs font-semibold text-slate-500">
              Based on available posting text
            </span>
          </div>

          <form onSubmit={handleSearch} className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_1fr_0.72fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Resume analysis
              </label>
              <select
                value={selectedAnalysis?.id || ""}
                onChange={(event) => setSelectedAnalysisId(event.target.value)}
                disabled={loadingAnalyses || normalizedAnalyses.length === 0}
                className="liquid-control h-11 w-full rounded-xl px-3 text-sm text-slate-800 outline-none transition focus:border-teal-300/70 focus:ring-4 focus:ring-teal-500/15"
              >
                {normalizedAnalyses.length ? (
                  normalizedAnalyses.map((analysis) => (
                    <option key={analysis.id} value={analysis.id}>
                      {compactFileName(analysis.fileName)} - {analysis.atsScore.score}% ATS
                    </option>
                  ))
                ) : (
                  <option>No saved analyses</option>
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Role
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="liquid-control h-11 w-full rounded-xl pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-300/70 focus:ring-4 focus:ring-teal-500/15"
                  placeholder="React developer"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location
              </label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={jobLocation}
                  onChange={(event) => setJobLocation(event.target.value)}
                  className="liquid-control h-11 w-full rounded-xl pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-300/70 focus:ring-4 focus:ring-teal-500/15"
                  placeholder="Bengaluru"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] xl:block">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="liquid-control h-11 w-full rounded-xl px-3 text-sm text-slate-800 outline-none transition focus:border-teal-300/70 focus:ring-4 focus:ring-teal-500/15"
                >
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <PrimaryButton
                type="submit"
                disabled={loadingJobs || loadingAnalyses || !normalizedAnalyses.length}
                className="mt-0 sm:self-end xl:mt-8"
              >
                {loadingJobs ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Target size={16} />
                )}
                {loadingJobs ? "Searching" : "Recommend"}
              </PrimaryButton>
            </div>
          </form>
        </section>

        {error && (
          <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{error}</p>
                {missingConfig.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {missingConfig.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-red-200 bg-white/65 px-2 py-1 text-xs font-semibold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {loadingAnalyses ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="liquid-glass h-24 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : normalizedAnalyses.length === 0 ? (
          <section className="liquid-glass rounded-2xl p-10 text-center">
            <div className="liquid-pill mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500">
              <FileText size={22} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-950">
              Analyze a resume first
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Job recommendations need an existing resume analysis so the system
              can reuse its skills, score, and embedding.
            </p>
            <PrimaryButton onClick={() => navigate("/analyzer")} className="mt-5">
              Analyze Resume
            </PrimaryButton>
          </section>
        ) : (
          <section className="space-y-4">
            {note && (
              <div className="liquid-pill rounded-xl p-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">
                  {fallback ? "Local fallback" : source || "Recommendations"}:
                </span>{" "}
                {note}
              </div>
            )}

            {loadingJobs ? (
              <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="liquid-glass h-40 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <JobCard
                  key={job.id || job.url}
                  job={job}
                  country={country}
                  analysis={selectedAnalysis}
                  onImprove={handleImprove}
                />
              ))
            ) : searched ? (
              <section className="liquid-glass rounded-2xl p-10 text-center">
                <div className="liquid-pill mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500">
                  <Search size={22} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-950">
                  No jobs returned
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Try a broader role, another city, or a different country.
                </p>
              </section>
            ) : (
              <section className="liquid-glass rounded-2xl p-10 text-center">
                <div className="liquid-pill mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500">
                  <Briefcase size={22} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-950">
                Search job recommendations
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Recommendations will appear here with fit scores, matched skills,
                  missing skills, and posting links when a live provider is configured.
                </p>
              </section>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default Jobs;
