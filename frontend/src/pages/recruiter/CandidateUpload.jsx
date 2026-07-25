import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import { PrimaryButton } from "../../components/ui/Buttons";
import {
  getCandidateProgress,
  listRecruiterJobs,
  uploadCandidateResumes,
} from "../../services/recruiterService";
import { inputClass, labelClass } from "../../utils/uiClasses";

const CandidateUpload = () => {
  const location = useLocation();
  const initialJobId = location.state?.jobId || "";
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState(initialJobId);
  const [files, setFiles] = useState([]);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === jobId) || null,
    [jobId, jobs]
  );

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      setLoadingJobs(true);
      setError("");

      try {
        const res = await listRecruiterJobs({ limit: 100 });
        if (!active) return;
        const loaded = res.data.jobs || [];
        setJobs(loaded);
        setJobId((current) => current || loaded[0]?.id || "");
      } catch (err) {
        if (!active) return;
        console.error("Load jobs for candidate upload error:", err);
        setError("Could not load job requirements.");
      } finally {
        if (active) setLoadingJobs(false);
      }
    };

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!jobId) return undefined;

    let active = true;

    const loadProgress = async () => {
      try {
        const res = await getCandidateProgress(jobId);
        if (active) setProgress(res.data);
      } catch {
        if (active) setProgress(null);
      }
    };

    loadProgress();
    const timer = window.setInterval(loadProgress, 4000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [jobId, result]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!jobId) {
      setError("Choose a job requirement before uploading resumes.");
      return;
    }

    if (!files.length) {
      setError("Choose at least one PDF resume.");
      return;
    }

    if (!consentConfirmed) {
      setError("Confirm candidate consent before upload.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("resumes", file));
      formData.append("consentConfirmed", "true");

      const res = await uploadCandidateResumes(jobId, formData);
      setResult(res.data);
      setFiles([]);
    } catch (err) {
      console.error("Candidate upload error:", err);
      setError(err.response?.data?.message || "Could not upload candidate resumes.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell
      title="Candidate uploads"
      description="Upload candidate PDF resumes for queued recruiter evaluation."
    >
      <div className="mx-auto max-w-5xl space-y-5">
        {error && (
          <section className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </section>
        )}

        <form onSubmit={handleSubmit} className="liquid-glass-strong rounded-2xl p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Job Requirement</label>
              <select
                value={jobId}
                onChange={(event) => setJobId(event.target.value)}
                className={inputClass}
                disabled={loadingJobs || !jobs.length}
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
            </div>

            <div>
              <label className={labelClass}>PDF Resumes</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className={inputClass}
                onChange={(event) => setFiles([...event.target.files])}
              />
            </div>
          </div>

          {selectedJob && (
            <div className="liquid-pill mt-4 rounded-xl p-3 text-sm text-slate-600">
              Evaluation target:{" "}
              <span className="font-semibold text-slate-950">
                {selectedJob.title}
              </span>
            </div>
          )}

          <label className="mt-4 flex items-start gap-3 rounded-xl border border-white/70 bg-white/35 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={consentConfirmed}
              onChange={(event) => setConsentConfirmed(event.target.checked)}
              className="mt-1"
            />
            <span>
              I confirm these candidate resumes were submitted with permission
              for recruiter evaluation.
            </span>
          </label>

          <PrimaryButton
            type="submit"
            disabled={uploading || loadingJobs || !jobs.length}
            className="mt-5"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UploadCloud size={16} />
            )}
            {uploading ? "Uploading" : "Upload resumes"}
          </PrimaryButton>
        </form>

        {progress && (
          <section className="liquid-glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Processing progress
            </h2>
            <p className="mt-2 text-sm text-slate-600">{progress.label}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {["queued", "processing", "completed", "failed"].map((key) => (
                <div key={key} className="liquid-pill rounded-xl p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {key}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">
                    {progress[key] || 0}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {result && (
          <section className="liquid-glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={18} />
              <h2 className="font-semibold">Batch queued</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {result.totalAccepted} accepted, {result.totalFailed} failed.
            </p>
            {result.failed?.length > 0 && (
              <div className="mt-4 space-y-2">
                {result.failed.map((item) => (
                  <div
                    key={`${item.fileName}-${item.message}`}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {item.fileName}: {item.message}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default CandidateUpload;
