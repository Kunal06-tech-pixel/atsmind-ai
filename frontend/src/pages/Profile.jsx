import { Briefcase, ShieldCheck, UserRound } from "lucide-react";
import AppShell from "../components/ui/AppShell";
import { useAuth } from "../context/useAuth";
import { getUserRole, USER_ROLES } from "../utils/roles";

const roleLabel = {
  [USER_ROLES.jobSeeker]: "Job seeker",
  [USER_ROLES.recruiter]: "Recruiter",
  [USER_ROLES.admin]: "Admin",
};

const roleIcon = {
  [USER_ROLES.jobSeeker]: UserRound,
  [USER_ROLES.recruiter]: Briefcase,
  [USER_ROLES.admin]: ShieldCheck,
};

const Profile = () => {
  const { user } = useAuth();
  const role = getUserRole(user);
  const Icon = roleIcon[role] || UserRound;

  return (
    <AppShell title="Profile" description="Review account and workspace details.">
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="liquid-glass-strong rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="liquid-button-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white">
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold tracking-tight text-slate-950">
                {user?.name || "Account"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
              <span className="mt-4 inline-flex rounded-lg border border-white/70 bg-white/45 px-3 py-1.5 text-sm font-semibold text-slate-700">
                {roleLabel[role] || "Job seeker"}
              </span>
            </div>
          </div>
        </section>

        {role === USER_ROLES.recruiter && (
          <section className="liquid-glass rounded-2xl p-5">
            <h3 className="text-base font-semibold tracking-tight text-slate-950">
              Company profile
            </h3>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <dt className="text-slate-500">Company</dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {user?.companyProfile?.companyName || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Designation</dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {user?.companyProfile?.designation || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Website</dt>
                <dd className="mt-1 truncate font-semibold text-slate-950">
                  {user?.companyProfile?.companyWebsite || "Not provided"}
                </dd>
              </div>
            </dl>
          </section>
        )}

        <section className="liquid-glass rounded-2xl p-5">
          <h3 className="text-base font-semibold tracking-tight text-slate-950">
            Role management
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Account role changes are not available from profile settings.
          </p>
        </section>
      </div>
    </AppShell>
  );
};

export default Profile;

