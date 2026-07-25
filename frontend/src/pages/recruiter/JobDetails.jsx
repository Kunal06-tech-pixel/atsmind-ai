import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  Briefcase,
  Loader2,
  Save,
  UploadCloud,
} from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Buttons";
import {
  getRecruiterJob,
  updateRecruiterJob,
} from "../../services/recruiterService";
import { inputClass, labelClass } from "../../utils/uiClasses";

const toSkillText = (skills) => (Array.isArray(skills) ? skills.join(", ") : "");

const splitSkills = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toForm = (job) => ({
  title: job.title || "",
  companyName: job.companyName || "",
  department: job.department || "",
  location: job.location || "",
  jobDescription: job.jobDescription || "",
  mandatorySkills: toSkillText(job.mandatorySkills),
  preferredSkills: toSkillText(job.preferredSkills),
  minimumExperience: String(job.minimumExperience || 0),
  minimumQualification: job.minimumQualification || "",
  status: job.status || "draft",
});

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadJob = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getRecruiterJob(jobId);
        if (!active) return;
        setJob(res.data.job);
        setForm(toForm(res.data.job));
      } catch (err) {
        if (!active) return;
        console.error("Load recruiter job error:", err);
        setError(err.response?.data?.message || "Could not load job requirement.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadJob();

    return () => {
      active = false;
    };
  }, [jobId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await updateRecruiterJob(jobId, {
        ...form,
        mandatorySkills: splitSkills(form.mandatorySkills),
        preferredSkills: splitSkills(form.preferredSkills),
        minimumExperience: Number(form.minimumExperience || 0),
      });

      setJob(res.data.job);
      setForm(toForm(res.data.job));
    } catch (err) {
      console.error("Update recruiter job error:", err);
      const details = err.response?.data?.details
        ?.map((item) => item.message)
        .join(" ");
      setError(
        details ||
          err.response?.data?.message ||
          "Could not update job requirement."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title={job?.title || "Job requirement"}
      description="Review and update the recruiter evaluation target."
      actions={
        <div className="flex gap-2">
          <SecondaryButton onClick={() => navigate("/recruiter/jobs")}>
            Back to jobs
          </SecondaryButton>
          <PrimaryButton
            disabled={!job}
            onClick={() =>
              navigate("/recruiter/candidates", { state: { jobId: job.id } })
            }
          >
            <UploadCloud size={16} />
            Upload resumes
          </PrimaryButton>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-5">
        {error && (
          <section className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </section>
        )}

        {loading || !form ? (
          <section className="liquid-glass grid min-h-60 place-items-center rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              Loading job requirement
            </div>
          </section>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <section className="liquid-glass-strong rounded-2xl p-5">
              <div className="mb-5 flex items-start gap-3">
                <div className="liquid-pill flex h-10 w-10 items-center justify-center rounded-xl text-slate-600">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                    Job details
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Candidate ranking will use this job description as the target.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Job Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Company Name</label>
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Department</label>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>Job Description</label>
                <textarea
                  name="jobDescription"
                  value={form.jobDescription}
                  onChange={handleChange}
                  rows={9}
                  className={`${inputClass} resize-y`}
                />
              </div>
            </section>

            <section className="liquid-glass rounded-2xl p-5">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                Evaluation requirements
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Mandatory Skills</label>
                  <textarea
                    name="mandatorySkills"
                    value={form.mandatorySkills}
                    onChange={handleChange}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Preferred Skills</label>
                  <textarea
                    name="preferredSkills"
                    value={form.preferredSkills}
                    onChange={handleChange}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Minimum Experience</label>
                  <input
                    name="minimumExperience"
                    type="number"
                    min="0"
                    max="60"
                    value={form.minimumExperience}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Minimum Qualification</label>
                  <input
                    name="minimumQualification"
                    value={form.minimumQualification}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <article className="liquid-glass rounded-2xl p-5">
                <p className="text-sm font-medium text-slate-500">Candidates</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {job?.candidateCount || 0}
                </p>
              </article>
              <article className="liquid-glass rounded-2xl p-5">
                <p className="text-sm font-medium text-slate-500">Evaluations</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {job?.evaluationCount || 0}
                </p>
              </article>
              <article className="liquid-glass rounded-2xl p-5">
                <p className="text-sm font-medium text-slate-500">Status</p>
                <p className="mt-2 text-3xl font-semibold capitalize tracking-tight text-slate-950">
                  {job?.status || "draft"}
                </p>
              </article>
            </section>

            <div className="flex justify-end gap-3">
              <SecondaryButton onClick={() => navigate("/recruiter/jobs")}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={saving}>
                <Save size={16} />
                {saving ? "Saving" : "Save changes"}
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
};

export default JobDetails;
