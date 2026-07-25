import { Clock3 } from "lucide-react";
import AppShell from "../../components/ui/AppShell";

const RecruiterPlaceholder = ({ title, description }) => {
  return (
    <AppShell title={title} description={description}>
      <div className="mx-auto max-w-7xl">
        <section className="liquid-glass-strong rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="liquid-pill flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-600">
              <Clock3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                This recruiter workflow is queued for the next implementation phase.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                The route is protected and ready. The data model, API, and
                interactive workflow will be connected in the recruiter build
                phases.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default RecruiterPlaceholder;

