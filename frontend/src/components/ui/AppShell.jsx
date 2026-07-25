import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Briefcase,
  CheckSquare,
  ClipboardList,
  FileStack,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";
import BrandMark from "../BrandMark";
import { useAuth } from "../../context/useAuth";
import { getUserRole, USER_ROLES } from "../../utils/roles";

const seekerNavItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Job Fit Analysis", to: "/analyzer", icon: Search },
  { label: "Resume Builder", to: "/builder", icon: FileText },
  { label: "Profile", to: "/profile", icon: UserRound },
];

const recruiterNavItems = [
  { label: "Dashboard", to: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Job Requirements", to: "/recruiter/jobs", icon: Briefcase },
  { label: "Create Job", to: "/recruiter/jobs/new", icon: ClipboardList },
  { label: "Candidate Uploads", to: "/recruiter/candidates", icon: UploadCloud },
  { label: "Candidate Rankings", to: "/recruiter/rankings", icon: BarChart3 },
  { label: "Candidate Comparison", to: "/recruiter/comparison", icon: FileStack },
  { label: "Shortlists", to: "/recruiter/shortlists", icon: CheckSquare },
  { label: "Reports", to: "/recruiter/reports", icon: FileText },
  { label: "Profile", to: "/recruiter/profile", icon: UserRound },
];

const adminNavItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: ShieldCheck },
];

const getNavItems = (user) => {
  const role = getUserRole(user);

  if (role === USER_ROLES.recruiter) return recruiterNavItems;
  if (role === USER_ROLES.admin) return adminNavItems;

  return seekerNavItems;
};

const NavList = ({ items, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.to;

        return (
          <button
            key={item.to}
            type="button"
            onClick={() => {
              navigate(item.to);
              onNavigate?.();
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "liquid-button-primary text-white"
                : "text-slate-600 hover:bg-white/35 hover:text-slate-950"
            }`}
          >
            <Icon size={17} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

const UserBlock = ({ user, onLogout }) => {
  const label = user?.name || user?.email || "Account";
  const initials = label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="liquid-glass rounded-2xl p-2">
      <div className="flex items-center gap-3">
        <div className="liquid-button-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white">
          {initials || "A"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-950">{label}</p>
          <p className="text-xs text-slate-500">Workspace</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50/70 hover:text-red-600"
          aria-label="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};

const AppShell = ({ title, description, actions, children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navItems = getNavItems(user);
  const workspaceLabel =
    getUserRole(user) === USER_ROLES.recruiter
      ? "Recruit workspace"
      : getUserRole(user) === USER_ROLES.admin
        ? "Admin workspace"
        : "Career workspace";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="glass-theme theme-bg min-h-screen text-slate-950">
      <aside className="liquid-glass-strong fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/60 px-4 py-5 xl:block">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-7 flex items-center gap-3 rounded-xl px-2 text-left"
        >
          <BrandMark className="h-9 w-9" compact />
          <span>
            <span className="block text-sm font-bold tracking-tight text-slate-950">
              ATSmind AI
            </span>
            <span className="block text-xs text-slate-500">Resume intelligence</span>
          </span>
        </button>

        <NavList items={navItems} />

        <div className="absolute bottom-5 left-4 right-4">
          <div className="liquid-pill mb-3 rounded-2xl p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
              {workspaceLabel}
            </p>
            <p className="mt-1 text-sm leading-5 text-blue-950">
              Evidence-based resume and recruitment evaluation.
            </p>
          </div>
          <UserBlock user={user} onLogout={handleLogout} />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close navigation overlay"
          />
          <div className="liquid-glass-strong relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-white/60 p-4">
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-3"
              >
                <BrandMark className="h-9 w-9" compact />
                <span className="text-sm font-bold text-slate-950">ATSmind AI</span>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="liquid-pill rounded-xl p-2 text-slate-500"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <NavList items={navItems} onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <UserBlock user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      )}

      <div className="xl:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/50 bg-white/38 shadow-sm shadow-teal-950/5 backdrop-blur-2xl">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="liquid-pill rounded-xl p-2 text-slate-600 xl:hidden"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
                  {title}
                </h1>
                {description && (
                  <p className="hidden truncate text-sm text-slate-500 md:block">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
