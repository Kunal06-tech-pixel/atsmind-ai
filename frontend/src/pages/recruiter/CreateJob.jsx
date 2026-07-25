import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Briefcase, Save } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Buttons";
import { createRecruiterJob } from "../../services/recruiterService";
import { inputClass, labelClass } from "../../utils/uiClasses";

const initialForm = {
  title: "",
  companyName: "",
  department: "",
  location: "",
  jobDescription: "",
  mandatorySkills: "",
  preferredSkills: "",
  minimumExperience: "0",
  minimumQualification: "",
  status: "draft",
};

const splitSkills = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const CreateJob = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await createRecruiterJob({
        ...form,
        mandatorySkills: splitSkills(form.mandatorySkills),
        preferredSkills: splitSkills(form.preferredSkills),
        minimumExperience: Number(form.minimumExperience || 0),
      });

      navigate(`/recruiter/jobs/${res.data.job.id}`);
    } catch (err) {
      console.error("Create recruiter job error:", err);
      const details = err.response?.data?.details
        ?.map((item) => item.message)
        .join(" ");
      setError(
        details ||
          err.response?.data?.message ||
          "Could not create job requirement."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title="Create job requirement"
      description="Define the job requirements candidates will be evaluated against."
      actions={
        <SecondaryButton onClick={() => navigate("/recruiter/jobs")}>
          Back to jobs
        </SecondaryButton>
      }
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-5">
        {error && (
          <section className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </section>
        )}

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
                The job description is the shared input for all candidate evaluations.
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
                placeholder="Senior Backend Engineer"
              />
            </div>

            <div>
              <label className={labelClass}>Company Name</label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Company name"
              />
            </div>

            <div>
              <label className={labelClass}>Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className={inputClass}
                placeholder="Engineering"
              />
            </div>

            <div>
              <label className={labelClass}>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className={inputClass}
                placeholder="Remote, Bengaluru"
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
              placeholder="Paste the complete job description here."
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
                placeholder="Node.js, Express.js, PostgreSQL"
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
                placeholder="AWS, Docker, Redis"
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
                placeholder="Bachelor's degree or equivalent experience"
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

        <div className="flex justify-end gap-3">
          <SecondaryButton onClick={() => navigate("/recruiter/jobs")}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={saving}>
            <Save size={16} />
            {saving ? "Saving" : "Save job"}
          </PrimaryButton>
        </div>
      </form>
    </AppShell>
  );
};

export default CreateJob;

