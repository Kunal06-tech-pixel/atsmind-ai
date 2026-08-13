import { useEffect, useRef, useState } from "react";
import {
  AlignLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import AnalysisResults from "./AnalysisResults";
import api from "../services/axios";
import { PrimaryButton, SecondaryButton } from "./ui/Buttons";
import { inputClass, labelClass } from "../utils/uiClasses";
import { useToast } from "./ui/useToast";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const preferredScrollBehavior = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

const waitForCompletedAnalysis = async (analysisId) => {
  let delay = 1200;

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const res = await api.get(`/api/resume/analyses/${analysisId}/status`);
    const { status, analysis, errorMessage } = res.data;

    if (status === "complete") {
      return analysis;
    }

    if (status === "failed") {
      throw new Error(errorMessage || "Resume analysis failed");
    }

    await sleep(delay);
    delay = Math.min(delay + 500, 5000);
  }

  throw new Error("Resume analysis timed out");
};

export default function DashboardResumeAnalyzer({ preloadedResult = null }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(preloadedResult || null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const loaderRef = useRef(null);
  const resultRef = useRef(null);
  const toast = useToast();

  const acceptFile = (file) => {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toast.error("Please upload a PDF resume.");
      return;
    }

    setResumeFile(file);
    toast.success(file.name, "Resume ready");
  };

  const handleFileChange = (event) => {
    acceptFile(event.target.files[0]);
    event.target.value = null;
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  };

  const handleClearFile = () => {
    setResumeFile(null);
  };

  const handleSubmit = async () => {
    if (!resumeFile) {
      toast.error("Please upload a resume first.");
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("companyName", companyName);
    formData.append("jobTitle", jobTitle);
    formData.append("jobDescription", jobDescription);

    try {
      const res = await api.post("/api/resume/upload", formData);
      const analysisId = res.data.analysisId || res.data.analysis?.id;

      if (res.data.status === "complete") {
        setAnalysisResult(res.data.analysis);
        toast.success("Your analysis report is ready.");
        return;
      }

      toast.info("Your resume is queued for analysis.", "Analysis started");

      const completedAnalysis = await waitForCompletedAnalysis(analysisId);
      setAnalysisResult(completedAnalysis);
      toast.success("Your analysis report is ready.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading && loaderRef.current) {
      loaderRef.current.scrollIntoView({ behavior: preferredScrollBehavior() });
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && analysisResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: preferredScrollBehavior() });
    }
  }, [analysisResult, loading]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="liquid-glass rounded-2xl p-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Analysis setup
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Match your resume to a real role.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add job context for more relevant ATS scoring and suggestions.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="analysis-company-name">Company Name</label>
              <div className="relative">
                <Building2
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="analysis-company-name"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className={`${inputClass} pl-9`}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="analysis-job-title">Job Title</label>
              <div className="relative">
                <Briefcase
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="analysis-job-title"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  className={`${inputClass} pl-9`}
                  placeholder="Product Manager"
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="analysis-job-description">Job Description</label>
              <div className="relative">
                <AlignLeft
                  size={16}
                  className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
                />
                <textarea
                  id="analysis-job-description"
                  rows={7}
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the job description or key responsibilities..."
                  className={`${inputClass} resize-none pl-9`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Upload
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Add your resume PDF.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                PDF only, up to 10MB. The file is sent to the existing analysis endpoint.
              </p>
            </div>
            <span className="liquid-pill rounded-lg px-2 py-1 text-xs font-semibold text-slate-500">
              PDF
            </span>
          </div>

          <label
            htmlFor="analysis-resume-file"
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition ${
              dragging
                ? "border-teal-400/70 bg-teal-50/60 shadow-lg shadow-teal-950/[0.08]"
                : "border-white/70 bg-white/28 hover:border-teal-200/80 hover:bg-white/42"
            }`}
          >
            {resumeFile ? (
              <div className="w-full max-w-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-50/70 text-emerald-700 backdrop-blur-xl">
                  <CheckCircle2 size={22} />
                </div>
                <p className="truncate text-sm font-semibold text-slate-950">
                  {resumeFile.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <>
                <div className="liquid-pill mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-slate-600">
                  <Upload size={22} />
                </div>
                <p className="text-sm font-semibold text-slate-950">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-sm text-slate-500">PDF only, max 10MB</p>
              </>
            )}

            <input
              id="analysis-resume-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {loading ? "Analyzing..." : "Save & Analyze Resume"}
            </PrimaryButton>

            {resumeFile && (
              <SecondaryButton type="button" onClick={handleClearFile}>
                <X size={16} />
                Remove
              </SecondaryButton>
            )}
          </div>
        </div>
      </section>

      {loading && (
        <section ref={loaderRef} className="liquid-glass rounded-2xl p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="liquid-pill flex h-12 w-12 items-center justify-center rounded-2xl text-slate-600">
              <Loader2 size={22} className="animate-spin" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-950">Analyzing your resume</p>
              <p className="mt-1 text-sm text-slate-500">
                Parsing the PDF, matching skills with embeddings, generating suggestions, and saving the report.
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-slate-950" />
              </div>
            </div>
          </div>
        </section>
      )}

      {!loading && analysisResult && (
        <section ref={resultRef}>
          <AnalysisResults data={analysisResult} />
        </section>
      )}
    </div>
  );
}
