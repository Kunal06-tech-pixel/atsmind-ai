import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Loader2, Save } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Buttons";
import {
  getCandidateEvaluation,
  updateCandidateEvaluationNotes,
  updateCandidateEvaluationStatus,
} from "../../services/recruiterService";
import { inputClass, labelClass } from "../../utils/uiClasses";

const statusOptions = ["pending", "reviewed", "shortlisted", "rejected", "selected"];

const statusClass = {
  strong: "border-emerald-200 bg-emerald-50 text-emerald-700",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  missing: "border-red-200 bg-red-50 text-red-700",
};

const CandidateDetails = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [notes, setNotes] = useState("");
  const [overrideScore, setOverrideScore] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadEvaluation = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getCandidateEvaluation(evaluationId);
        if (!active) return;
        setEvaluation(res.data.evaluation);
        setNotes(res.data.evaluation.recruiterNotes || "");
        setOverrideScore(
          res.data.evaluation.recruiterOverrideScore == null
            ? ""
            : String(res.data.evaluation.recruiterOverrideScore)
        );
      } catch (err) {
        if (!active) return;
        console.error("Load candidate evaluation error:", err);
        setError(err.response?.data?.message || "Could not load candidate evaluation.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadEvaluation();

    return () => {
      active = false;
    };
  }, [evaluationId]);

  const updateStatus = async (recruitmentStatus) => {
    setSaving(true);
    setError("");

    try {
      const res = await updateCandidateEvaluationStatus(
        evaluationId,
        recruitmentStatus
      );
      setEvaluation(res.data.evaluation);
    } catch (err) {
      console.error("Update evaluation status error:", err);
      setError(err.response?.data?.message || "Could not update status.");
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await updateCandidateEvaluationNotes(evaluationId, {
        recruiterNotes: notes,
        recruiterOverrideScore: overrideScore === "" ? null : Number(overrideScore),
      });
      setEvaluation(res.data.evaluation);
    } catch (err) {
      console.error("Update evaluation notes error:", err);
      setError(err.response?.data?.message || "Could not save notes.");
    } finally {
      setSaving(false);
    }
  };

  const candidate = evaluation?.candidate || {};

  return (
    <AppShell
      title={
        candidate.candidateName ||
        candidate.originalFileName ||
        "Candidate details"
      }
      description="Review score breakdown, evidence, and recruiter notes."
      actions={
        <SecondaryButton onClick={() => navigate("/recruiter/rankings")} className="hidden sm:inline-flex">
          Back to rankings
        </SecondaryButton>
      }
    >
      <div className="mx-auto max-w-7xl space-y-5">
        {error && (
          <section id="candidate-details-error" role="alert" aria-live="polite" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </section>
        )}

        {loading || !evaluation ? (
          <section className="liquid-glass grid min-h-60 place-items-center rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              Loading candidate
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-5">
              {[
                ["Overall", evaluation.scores?.overallScore],
                ["Skill", evaluation.scores?.skillMatch],
                ["Semantic", evaluation.scores?.semanticSimilarity],
                ["Keyword", evaluation.scores?.keywordCoverage],
                ["Quality", evaluation.scores?.resumeQuality],
              ].map(([label, value]) => (
                <article key={label} className="liquid-glass rounded-2xl p-5">
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    {value || 0}%
                  </p>
                </article>
              ))}
            </section>

            {evaluation.mandatoryRequirementWarnings?.length > 0 && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Missing mandatory requirements:{" "}
                {evaluation.mandatoryRequirementWarnings.join(", ")}
              </section>
            )}

            <section className="liquid-glass-strong rounded-2xl p-5">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                Recruiter summary
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {evaluation.recruiterSummary ||
                  "No recruiter summary was generated."}
              </p>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="liquid-glass rounded-2xl p-5">
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                  Matched skills
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(evaluation.matchedSkills || []).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="liquid-glass rounded-2xl p-5">
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                  Missing skills
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(evaluation.missingSkills || []).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="liquid-glass rounded-2xl p-5">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                Requirement-level evidence
              </h2>
              <div className="mt-4 space-y-3">
                {(evaluation.requirementEvidence || []).map((entry) => (
                  <article
                    key={entry.requirement}
                    className="rounded-xl border border-white/70 bg-white/35 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {entry.requirement}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {entry.requirementType}{" "}
                          {entry.mandatory ? "| mandatory" : "| preferred"}
                        </p>
                      </div>
                      <span
                        className={`w-fit rounded-md border px-2 py-1 text-xs font-semibold ${
                          statusClass[entry.status] || statusClass.missing
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    {entry.bestEvidence?.text ? (
                      <blockquote className="mt-3 rounded-lg bg-white/45 p-3 text-sm leading-6 text-slate-700">
                        {entry.bestEvidence.text}
                      </blockquote>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        No supporting evidence retrieved.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section className="liquid-glass-strong rounded-2xl p-5">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                Review controls
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="candidate-review-status">Review Status</label>
                  <select
                    id="candidate-review-status"
                    value={evaluation.recruitmentStatus}
                    onChange={(event) => updateStatus(event.target.value)}
                    className={inputClass}
                    disabled={saving}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "candidate-details-error" : undefined}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass} htmlFor="candidate-override-score">Override Score</label>
                  <input
                    id="candidate-override-score"
                    value={overrideScore}
                    onChange={(event) => setOverrideScore(event.target.value)}
                    type="number"
                    min="0"
                    max="100"
                    className={inputClass}
                    placeholder="Optional"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "candidate-details-error" : undefined}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelClass} htmlFor="candidate-recruiter-notes">Recruiter Notes</label>
                <textarea
                  id="candidate-recruiter-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={5}
                  className={`${inputClass} resize-y`}
                  placeholder="Private notes for this candidate"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "candidate-details-error" : undefined}
                />
              </div>
              <PrimaryButton onClick={saveNotes} disabled={saving} className="mt-4">
                <Save size={16} />
                Save notes
              </PrimaryButton>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default CandidateDetails;

