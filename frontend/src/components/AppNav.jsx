import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  FileText,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { getUserRole, USER_ROLES } from "../utils/roles";

const seekerNavItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Job Fit Analysis", to: "/analyzer", icon: Search },
  { label: "Resume Builder", to: "/builder", icon: FileText },
];

const recruiterNavItems = [
  { label: "Dashboard", to: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Job Requirements", to: "/recruiter/jobs", icon: Briefcase },
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

const AppNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const navItems = getNavItems(user);

  const goToLogin = () => navigate("/login", { state: { mode: "login" } });
  const goToSignup = () => navigate("/login", { state: { mode: "signup" } });

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-4 sm:px-6 lg:px-8">
      <div className="liquid-glass-strong mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-3xl px-4 py-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex shrink-0 items-center gap-2 text-sm font-bold tracking-tight text-slate-950"
        >
          <span className="liquid-button-primary flex h-8 w-8 items-center justify-center rounded-xl text-white">
            <Sparkles size={16} />
          </span>
          ATSmind AI
        </button>

        <div className="liquid-segmented hidden min-w-0 items-center gap-1 overflow-x-auto rounded-2xl p-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;

            return (
              <button
                key={item.to}
                type="button"
                onClick={() => navigate(item.to)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "liquid-pill text-slate-950"
                    : "text-slate-500 hover:bg-white/30 hover:text-slate-950"
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="liquid-pill hidden max-w-40 shrink-0 truncate rounded-xl px-3 py-2 text-sm font-semibold text-teal-800 sm:inline">
                {user.name || user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="liquid-button-primary liquid-shine rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={goToLogin}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/35 hover:text-slate-950"
              >
                Login
              </button>
              <button
                type="button"
                onClick={goToSignup}
                className="liquid-button-primary liquid-shine inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Sign Up
                <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AppNav;
