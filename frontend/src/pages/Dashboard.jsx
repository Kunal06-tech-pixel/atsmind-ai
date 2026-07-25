import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  Clock3,
  FileText,
  Plus,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import ScoreRing from "../components/ScoreRing";
import AppShell from "../components/ui/AppShell";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import api from "../services/axios";
import { useAuth } from "../context/useAuth";
import {
  compactFileName,
  formatRelativeTime,
  normalizeAnalysis,
} from "../utils/analysis";

const filterItems = [
  { label: "All", value: "all" },
  { label: "High fit", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Needs work", value: "low" },
];

const scoreBucket = (score) => {
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  return "low";
};

const scoreBadgeClass = (score) => {
  if (score >= 75) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 45) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-700";
};

const StatCard = ({ label, value, icon, detail }) => {
  const IconComponent = icon;

  return (
    <div className="liquid-glass liquid-hover rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div className="liquid-pill flex h-10 w-10 items-center justify-center rounded-xl text-slate-600">
          <IconComponent size={18} />
        </div>
      </div>
      {detail && <p className="mt-3 text-sm text-slate-500">{detail}</p>}
    </div>
  );
};

const AnalysisMobileCard = ({ analysis, onNavigate }) => {
  const normalized = normalizeAnalysis(analysis);
  if (!normalized) return null;

  const score = normalized.atsScore.score;
  const skills = normalized.skillsDetected.length
    ? normalized.skillsDetected
    : normalized.skillsMatch;

  return (
    <button
      type="button"
      onClick={() => onNavigate(normalized.id)}
      className="liquid-glass liquid-hover w-full rounded-2xl p-4 text-left transition md:hidden"
    >
      <div className="flex items-start gap-4">
        <ScoreRing score={score} size={54} strokeWidth={4} animated={false} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-sm font-semibold text-slate-950">
              {compactFileName(normalized.fileName)}
            </h3>
            <ChevronRight size={17} className="shrink-0 text-slate-400" />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {formatRelativeTime(normalized.createdAt)}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
            {normalized.summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.slice(0, 4).map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="liquid-pill rounded-lg px-2 py-1 text-xs font-medium text-slate-600"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};

const AnalysisTable = ({ analyses, onNavigate }) => (
  <div className="liquid-glass hidden overflow-hidden rounded-2xl md:block">
    <table className="w-full border-collapse text-left">
      <thead className="liquid-divider border-b bg-white/28">
        <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          <th className="px-4 py-3">Resume</th>
          <th className="px-4 py-3">Score</th>
          <th className="px-4 py-3">Skills</th>
          <th className="px-4 py-3">Updated</th>
          <th className="px-4 py-3 text-right">Open</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/50">
        {analyses.map((analysis) => {
          const normalized = normalizeAnalysis(analysis);
          if (!normalized) return null;

          const score = normalized.atsScore.score;
          const skills = normalized.skillsDetected.length
            ? normalized.skillsDetected
            : normalized.skillsMatch;

          return (
            <tr
              key={normalized.id}
              className="group cursor-pointer transition hover:bg-white/32"
              onClick={() => onNavigate(normalized.id)}
            >
              <td className="max-w-[22rem] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="liquid-pill flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500">
                    <FileText size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {compactFileName(normalized.fileName)}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {normalized.summary}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${scoreBadgeClass(score)}`}
                >
                  {score}% ATS
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex max-w-sm flex-wrap gap-1.5">
                  {skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="liquid-pill rounded-lg px-2 py-1 text-xs font-medium text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="liquid-pill rounded-lg px-2 py-1 text-xs font-medium text-slate-500">
                      +{skills.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                {formatRelativeTime(normalized.createdAt)}
              </td>
              <td className="px-4 py-4 text-right">
                <ArrowUpRight
                  size={17}
                  className="ml-auto text-slate-400 transition group-hover:text-slate-950"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2, 3].map((item) => (
      <div
        key={item}
        className="liquid-glass h-20 animate-pulse rounded-2xl"
      />
    ))}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;

    const loadAnalyses = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/api/resume/analyses");

        if (!active) return;

        const loadedAnalyses = res.data.analyses || [];
        setAnalyses(loadedAnalyses);
        setTotal(res.data.total ?? loadedAnalyses.length);
      } catch (err) {
        if (!active) return;
        console.error("Load analyses error:", err);
        setError("Could not load your recent analyses.");
      } finally {
        if (active) setLoading(false);
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

  const filteredAnalyses = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    return normalizedAnalyses.filter((analysis) => {
      const matchesFilter =
        filter === "all" || scoreBucket(analysis.atsScore.score) === filter;

      if (!matchesFilter) return false;
      if (!lowerQuery) return true;

      const haystack = [
        analysis.fileName,
        analysis.summary,
        analysis.jobTitle,
        analysis.companyName,
        ...analysis.skillsDetected,
        ...analysis.missingSkills,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(lowerQuery);
    });
  }, [filter, normalizedAnalyses, query]);

  const averageScore = normalizedAnalyses.length
    ? Math.round(
        normalizedAnalyses.reduce(
          (sum, analysis) => sum + analysis.atsScore.score,
          0
        ) / normalizedAnalyses.length
      )
    : 0;

  const highFitCount = normalizedAnalyses.filter(
    (analysis) => analysis.atsScore.score >= 75
  ).length;

  const handleNavigateToResume = (analysisId) => {
    navigate(`/resume/${analysisId}`);
  };

  const firstName = user?.name?.split(" ")?.[0];

  return (
    <AppShell
      title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
      description="Track resume quality, review AI feedback, and continue improving."
      actions={
        <PrimaryButton onClick={() => navigate("/analyzer")} className="hidden sm:inline-flex">
          <Plus size={16} />
          New analysis
        </PrimaryButton>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Total analyses"
            value={total}
            icon={FileText}
            detail="Saved to your workspace"
          />
          <StatCard
            label="Average ATS score"
            value={`${averageScore}%`}
            icon={Target}
            detail="Across saved reports"
          />
          <StatCard
            label="High-fit resumes"
            value={highFitCount}
            icon={Sparkles}
            detail="Scored 75% or higher"
          />
        </section>

        <section className="liquid-glass rounded-2xl p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-950">
                <Clock3 size={17} className="text-slate-500" />
                Recent analyses
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and filter reports already loaded from your account.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="liquid-control h-10 w-full rounded-xl pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-300/70 focus:ring-4 focus:ring-teal-500/15 sm:w-72"
                  placeholder="Search resumes, skills, roles..."
                />
              </div>

              <div className="liquid-segmented flex rounded-2xl p-1">
                {filterItems.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      filter === item.value
                        ? "liquid-pill text-slate-950"
                        : "text-slate-500 hover:text-slate-950"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : filteredAnalyses.length > 0 ? (
          <section className="space-y-3">
            <AnalysisTable
              analyses={filteredAnalyses}
              onNavigate={handleNavigateToResume}
            />
            {filteredAnalyses.map((analysis) => (
              <AnalysisMobileCard
                key={analysis.id}
                analysis={analysis}
                onNavigate={handleNavigateToResume}
              />
            ))}
          </section>
        ) : (
          <section className="liquid-glass rounded-2xl border-dashed border-slate-300/70 p-10 text-center">
            <div className="liquid-pill mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500">
              <Search size={22} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-950">
              {normalizedAnalyses.length ? "No matching analyses" : "No analyses yet"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {normalizedAnalyses.length
                ? "Try a different search term or score filter."
                : "Upload a PDF resume in the analyzer to create your first saved report."}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {normalizedAnalyses.length ? (
                <SecondaryButton
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </SecondaryButton>
              ) : (
                <PrimaryButton onClick={() => navigate("/analyzer")}>
                  Analyze Resume
                </PrimaryButton>
              )}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default Dashboard;
