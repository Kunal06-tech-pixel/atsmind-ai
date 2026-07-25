import { useNavigate } from "react-router-dom";
import PageShell from "../components/ui/PageShell";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import { useAuth } from "../context/useAuth";
import { getDashboardPathByRole } from "../utils/roles";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <PageShell className="grid min-h-[calc(100vh-5rem)] place-items-center px-4 py-12">
      <section className="liquid-glass-strong w-full max-w-lg rounded-3xl p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
          Access restricted
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          This workspace is not available for your account.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
          Your account role does not have permission to open this page.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <PrimaryButton onClick={() => navigate(getDashboardPathByRole(user))}>
            Go to dashboard
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate("/")}>Back home</SecondaryButton>
        </div>
      </section>
    </PageShell>
  );
};

export default Unauthorized;

