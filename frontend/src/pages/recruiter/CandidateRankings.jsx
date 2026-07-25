import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import { SecondaryButton } from "../../components/ui/Buttons";
import {
  getCandidateRankings,
  listRecruiterJobs,
  updateCandidateEvaluationStatus,
} from "../../services/recruiterService";

const statusClass = {
  pending: "border-slate-200 bg-slate-50 text-slate-700",
  reviewed: "border-blue-200 bg-blue-50 text-blue-700",
  shortlisted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  selected: "border-teal-200 bg-teal-50 text-teal-700",
};

const CandidateRankings = ({ statusFilter = "" }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === jobId) || null,
    [jobId, jobs]
  );

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      try {
        const res = await listRecruiterJobs({ limit: 100 });
        if (!active) return;
        const loaded = res.data.jobs || [];
        setJobs(loaded);
        setJobId((current) => current || loaded[0]?.id || "");
      } catch (err) {
        if (!active) return;
        console.error("Load jobs for rankings error:", err);
        setError("Could not load job requirements.");
        setLoading(false);
      }
    };

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    const loadRankings = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getCandidateRankings(jobId, {
          limit: 100,
          status: statusFilter || undefined,
          search: search.trim() || undefined,
        });
        if (active) setEvaluations(res.data.evaluations || []);
      } catch (err) {
        if (!active) return;
        console.error("Load rankings error:", err);
        setError(err.response?.data?.message || "Could not load rankings.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRankings();

    return () => {
      active = false;
    };
  }, [jobId, search, statusFilter]);

  const updateStatus = async (evaluationId, recruitmentStatus) => {
    setUpdatingId(evaluationId);
    setError("");

    try {
      const res = await updateCandidateEvaluationStatus(
        evaluationId,
        recruitmentStatus
      );
      setEvaluations((current) =>
        current.map((evaluation) =>
          evaluation.id === evaluationId ? res.data.evaluation : evaluation
        )
      );
    } catch (err) {
      console.error("Update candidate status error:", err);
      setError(err.response?.data?.message || "Could not update candidate status.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <AppShell
      title={statusFilter === "shortlisted" ? "Shortlists" : "Candidate rankings"}
      description="Ranked by deterministic resume-to-job match score."
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="liquid-glass rounded-2xl p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <select
              value={jobId}
              onChange={(event) => setJobId(event.target.value)}
              className="liquid-control h-10 rounded-xl px-3 text-sm text-slate-800 outline-none lg:w-80"
            >
              {jobs.length ? (
                jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))
              ) : (
                <option>No job requirements available</option>
              )}
            </select>

            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="liquid-control h-10 w-full rounded-xl pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-300/70 focus:ring-4 focus:ring-teal-500/15 lg:w-80"
                placeholder="Search candidates"
              />
            </div>
          </div>
        </section>

        {selectedJob && (
          <section className="liquid-pill rounded-xl p-3 text-sm text-slate-600">
            Evaluation target:{" "}
            <span className="font-semibold text-slate-950">
              {selectedJob.title}
            </span>
          </section>
        )}

        {error && (
          <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </section>
        )}

        {loading ? (
          <section className="liquid-glass grid min-h-60 place-items-center rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              Loading rankings
            </div>
          </section>
        ) : evaluations.length ? (
          <section className="liquid-glass overflow-hidden rounded-2xl">
            <table className="w-full border-collapse text-left">
              <thead className="liquid-divider border-b bg-white/28">
                <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Overall</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Breakdown</th>
                  <th className="hidden px-4 py-3 xl:table-cell">Evidence</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50">
                {evaluations.map((evaluation) => {
                  const candidate = evaluation.candidate || {};
                  const missingMandatory =
                    evaluation.mandatoryRequirementWarnings?.length || 0;

                  return (
                    <tr key={evaluation.id} className="transition hover:bg-white/32">
                      <td className="px-4 py-4 text-lg font-semibold text-slate-950">
                        {evaluation.systemRank || "-"}
                      </td>
                      <td className="max-w-xs px-4 py-4">
                        <p className="font-semibold text-slate-950">
                          {candidate.candidateName ||
                            candidate.originalFileName ||
                            "Candidate"}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {candidate.candidateEmail || candidate.originalFileName}
                        </p>
                        {missingMandatory > 0 && (
                          <p className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                            <AlertTriangle size={13} />
                            {missingMandatory} mandatory gap
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xl font-semibold text-slate-950">
                          {evaluation.scores?.overallScore || 0}%
                        </span>
                      </td>
                      <td className="hidden px-4 py-4 text-sm text-slate-600 lg:table-cell">
                        Skill {evaluation.scores?.skillMatch || 0}% | Semantic{" "}
                        {evaluation.scores?.semanticSimilarity || 0}% | Keyword{" "}
                        {evaluation.scores?.keywordCoverage || 0}% | Quality{" "}
                        {evaluation.scores?.resumeQuality || 0}%
                      </td>
                      <td className="hidden px-4 py-4 text-sm text-slate-600 xl:table-cell">
                        {evaluation.strongEvidenceCount || 0} strong,{" "}
                        {evaluation.partialEvidenceCount || 0} partial
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${
                            statusClass[evaluation.recruitmentStatus] ||
                            statusClass.pending
                          }`}
                        >
                          {evaluation.recruitmentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <SecondaryButton
                            onClick={() =>
                              navigate(`/recruiter/evaluations/${evaluation.id}`)
                            }
                            className="px-3 py-2"
                          >
                            <ArrowUpRight size={15} />
                            Open
                          </SecondaryButton>
                          <button
                            type="button"
                            disabled={updatingId === evaluation.id}
                            onClick={() =>
                              updateStatus(evaluation.id, "shortlisted")
                            }
                            className="liquid-pill inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-emerald-700 disabled:opacity-60"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === evaluation.id}
                            onClick={() => updateStatus(evaluation.id, "rejected")}
                            className="liquid-pill inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-red-600 disabled:opacity-60"
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ) : (
          <section className="liquid-glass-strong rounded-2xl p-10 text-center">
            <div className="liquid-pill mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500">
              <BarChart3 size={22} />
            </div>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
              No candidate evaluations yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Upload resumes and wait for candidate analysis to complete.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default CandidateRankings;

