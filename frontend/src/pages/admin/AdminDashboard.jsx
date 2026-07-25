import { ShieldCheck, Users } from "lucide-react";
import AppShell from "../../components/ui/AppShell";

const AdminDashboard = () => {
  return (
    <AppShell
      title="Admin dashboard"
      description="Administrative controls for platform oversight."
    >
      <div className="mx-auto max-w-7xl">
        <section className="liquid-glass-strong rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="liquid-pill flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                Admin workspace is available.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                User oversight, recruiter verification, and platform reports can
                be added here after the recruiter workflow is stable.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="liquid-glass rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Users</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  0
                </p>
              </div>
              <div className="liquid-pill flex h-10 w-10 items-center justify-center rounded-xl text-slate-600">
                <Users size={18} />
              </div>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
};

export default AdminDashboard;

