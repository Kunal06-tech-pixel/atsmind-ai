import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Buttons";
import { listRecruiterJobs, deleteRecruiterJob } from "../../services/recruiterService";

const statusItems = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Closed", value: "closed" },
];

const statusClass = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  closed: "border-slate-200 bg-white/55 text-slate-500",
};

const formatDate = (value) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString();
};

const JobOpenings = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const params = useMemo(
    () => ({
      status: status || undefined,
      search: search.trim() || undefined,
      limit: 50,
    }),
    [search, status]
  );

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await listRecruiterJobs(params);
        if (!active) return;
        setJobs(res.data.jobs || []);
      } catch (err) {
        if (!active) return;
        console.error("Load recruiter jobs error:", err);
        setError(err.response?.data?.message || "Could not load job requirements.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadJobs();

    return () => {
      active = false;
    };
  }, [params]);

  const handleDelete = async (job) => {
    const confirmed = window.confirm(
      `Delete "${job.title}" and its recruiter candidate data?`
    );

    if (!confirmed) return;

    setDeletingId(job.id);
    setError("");

    try {
      await deleteRecruiterJob(job.id);
      setJobs((current) => current.filter((item) => item.id !== job.id));
    } catch (err) {
      console.error("Delete recruiter job error:", err);
      setError(err.response?.data?.message || "Could not delete job requirement.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <AppShell
      title="Job requirements"
      description="Manage recruiter job requirements for candidate evaluation."
      actions={
        <PrimaryButton onClick={() => navigate("/recruiter/jobs/new")}>
          <Plus size={16} />
          Create job
        </PrimaryButton>
      }
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="liquid-glass rounded-2xl p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                aria-label="Search job requirements"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="liquid-control h-10 w-full rounded-xl pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-300/70 focus:ring-4 focus:ring-teal-500/15 lg:w-80"
                placeholder="Search title, company, location"
              />
            </div>

            <div className="liquid-segmented flex w-full overflow-x-auto rounded-2xl p-1 lg:w-auto" role="group" aria-label="Filter job requirements by status">
              {statusItems.map((item) => (
                <button
                  key={item.value || "all"}
                  type="button"
                  aria-pressed={status === item.value}
                  onClick={() => setStatus(item.value)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    status === item.value
                      ? "liquid-pill text-slate-950"
                      : "text-slate-500 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <section role="alert" aria-live="polite" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </section>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="liquid-glass h-24 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : jobs.length ? (
          <section className="liquid-glass overflow-hidden rounded-2xl">
            <table className="hidden w-full border-collapse text-left md:table">
              <thead className="liquid-divider border-b bg-white/28">
                <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-4 py-3">Requirement</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Candidates</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50">
                {jobs.map((job) => (
                  <tr key={job.id} className="transition hover:bg-white/32">
                    <td className="max-w-xl px-4 py-4">
                      <p className="font-semibold text-slate-950">{job.title}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {[job.companyName, job.department, job.location]
                          .filter(Boolean)
                          .join(" | ") || "No company details"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${
                          statusClass[job.status] || statusClass.draft
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {job.candidateCount || 0} uploaded
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {formatDate(job.updatedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <SecondaryButton
                          onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                          className="px-3 py-2"
                        >
                          <ArrowUpRight size={15} />
                          Open
                        </SecondaryButton>
                        <button
                          type="button"
                          onClick={() => handleDelete(job)}
                          disabled={deletingId === job.id}
                          className="liquid-pill inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === job.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="grid gap-3 p-3 md:hidden">
              {jobs.map((job) => (
                <article key={job.id} className="liquid-pill rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{job.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {job.companyName || "No company details"}
                      </p>
                    </div>
                    <span
                      className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                        statusClass[job.status] || statusClass.draft
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <SecondaryButton
                      onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                      className="flex-1 px-3 py-2"
                    >
                      Open
                    </SecondaryButton>
                    <button
                      type="button"
                      onClick={() => handleDelete(job)}
                      className="liquid-pill inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="liquid-glass-strong rounded-2xl p-10 text-center">
            <div className="liquid-pill mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500">
              <Briefcase size={22} />
            </div>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
              No job requirements yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Create a job requirement before uploading candidate resumes.
            </p>
            <PrimaryButton onClick={() => navigate("/recruiter/jobs/new")} className="mt-5">
              <Plus size={16} />
              Create job
            </PrimaryButton>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default JobOpenings;

