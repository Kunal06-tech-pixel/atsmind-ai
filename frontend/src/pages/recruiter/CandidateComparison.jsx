import { useEffect, useState } from "react";
import { GitCompareArrows, Loader2 } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import { PrimaryButton } from "../../components/ui/Buttons";
import {
  compareCandidateEvaluations,
  getCandidateRankings,
  listRecruiterJobs,
} from "../../services/recruiterService";

const CandidateComparison = () => {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState("");

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
        console.error("Load jobs for comparison error:", err);
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

    const loadEvaluations = async () => {
      setLoading(true);
      setError("");
      setComparison(null);
      setSelectedIds([]);

      try {
        const res = await getCandidateRankings(jobId, { limit: 100 });
        if (active) setEvaluations(res.data.evaluations || []);
      } catch (err) {
        if (!active) return;
        console.error("Load evaluations for comparison error:", err);
        setError(err.response?.data?.message || "Could not load candidates.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadEvaluations();

    return () => {
      active = false;
    };
  }, [jobId]);

  const toggleSelection = (evaluationId) => {
    setSelectedIds((current) => {
      if (current.includes(evaluationId)) {
        return current.filter((id) => id !== evaluationId);
      }

      if (current.length >= 3) return current;

      return [...current, evaluationId];
    });
  };

  const handleCompare = async () => {
    setComparing(true);
    setError("");

    try {
      const res = await compareCandidateEvaluations(jobId, selectedIds);
      setComparison(res.data);
    } catch (err) {
      console.error("Compare candidates error:", err);
      setError(err.response?.data?.message || "Could not compare candidates.");
    } finally {
      setComparing(false);
    }
  };

  return (
    <AppShell
      title="Candidate comparison"
      description="Compare two or three candidates against each job requirement."
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

            <PrimaryButton
              onClick={handleCompare}
              disabled={selectedIds.length < 2 || comparing}
            >
              {comparing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <GitCompareArrows size={16} />
              )}
              Compare
            </PrimaryButton>
          </div>
        </section>

        {error && (
          <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </section>
        )}

        {loading ? (
          <section className="liquid-glass grid min-h-60 place-items-center rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              Loading candidates
            </div>
          </section>
        ) : (
          <section className="liquid-glass rounded-2xl p-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Select candidates
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {evaluations.map((evaluation) => {
                const candidate = evaluation.candidate || {};
                const checked = selectedIds.includes(evaluation.id);

                return (
                  <label
                    key={evaluation.id}
                    className={`rounded-xl border p-4 transition ${
                      checked
                        ? "border-teal-300 bg-teal-50/70"
                        : "border-white/70 bg-white/35"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelection(evaluation.id)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-semibold text-slate-950">
                          {candidate.candidateName ||
                            candidate.originalFileName ||
                            "Candidate"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Rank {evaluation.systemRank || "-"} |{" "}
                          {evaluation.scores?.overallScore || 0}% overall
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        {comparison && (
          <section className="liquid-glass overflow-x-auto rounded-2xl p-4">
            <table className="min-w-[900px] w-full border-collapse text-left">
              <thead className="liquid-divider border-b bg-white/28">
                <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-4 py-3">Requirement</th>
                  {comparison.evaluations.map((evaluation) => (
                    <th key={evaluation.id} className="px-4 py-3">
                      {evaluation.candidate?.candidateName ||
                        evaluation.candidate?.originalFileName ||
                        "Candidate"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50">
                {comparison.rows.map((row) => (
                  <tr key={row.requirement}>
                    <td className="max-w-xs px-4 py-4 align-top">
                      <p className="font-semibold text-slate-950">
                        {row.requirement}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.mandatory ? "Mandatory" : "Preferred"}
                      </p>
                    </td>
                    {row.candidates.map((candidate) => (
                      <td
                        key={`${row.requirement}-${candidate.evaluationId}`}
                        className="max-w-sm px-4 py-4 align-top"
                      >
                        <span className="rounded-md border border-white/70 bg-white/50 px-2 py-1 text-xs font-semibold text-slate-700">
                          {candidate.status}
                        </span>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {candidate.bestEvidence?.text || "No evidence retrieved."}
                        </p>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default CandidateComparison;

