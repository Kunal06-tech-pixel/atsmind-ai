import {
  Briefcase,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/ui/AppShell";
import { PrimaryButton } from "../../components/ui/Buttons";

const stats = [
  { label: "Job requirements", value: "0", icon: Briefcase },
  { label: "Candidates uploaded", value: "0", icon: FileText },
  { label: "Candidates analysed", value: "0", icon: ListChecks },
  { label: "Shortlisted", value: "0", icon: CheckCircle2 },
];

const RecruiterDashboard = () => {
  const navigate = useNavigate();

  return (
    <AppShell
      title="Recruiter dashboard"
      description="Track job requirements, candidate evaluations, and review status."
      actions={
        <PrimaryButton onClick={() => navigate("/recruiter/jobs/new")}>
          <Briefcase size={16} />
          Create job
        </PrimaryButton>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article key={stat.label} className="liquid-glass rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                      {stat.value}
                    </p>
                  </div>
                  <div className="liquid-pill flex h-10 w-10 items-center justify-center rounded-xl text-slate-600">
                    <Icon size={18} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="liquid-glass-strong rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="liquid-pill flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-600">
              <Clock3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                Recruit workspace is ready for job management.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Job requirements, candidate uploads, rankings, comparison, and
                review actions will appear here as the recruiter workflow is
                connected.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default RecruiterDashboard;
