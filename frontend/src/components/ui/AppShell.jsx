import { useCallback, useEffect, useRef, useState } from "react";
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
  const directlyMatchedItem = [...items]
    .sort((left, right) => right.to.length - left.to.length)
    .find(
      (item) =>
        location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
    );

  const fallbackActivePath = location.pathname.startsWith("/resume/")
    ? "/dashboard"
    : location.pathname.startsWith("/recruiter/evaluations/")
      ? "/recruiter/rankings"
      : null;

  return (
    <div className="ats-workspace-nav-list">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.to === (directlyMatchedItem?.to || fallbackActivePath);

        return (
          <button
            key={item.to}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => {
              navigate(item.to);
              onNavigate?.();
            }}
            className={`ats-workspace-nav-item${active ? " is-active" : ""}`}
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
    <div className="ats-workspace-user-block">
      <div className="flex items-center gap-3">
        <div className="ats-workspace-avatar">
          {initials || "A"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="ats-workspace-user-name">{label}</p>
          <p className="ats-workspace-user-meta">Workspace</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="ats-workspace-logout"
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
  const mobileDrawerRef = useRef(null);
  const mobileTriggerRef = useRef(null);
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

  const closeMobileNavigation = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => {
      mobileTriggerRef.current?.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileDrawerRef.current?.querySelector("button")?.focus({ preventScroll: true });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileNavigation();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = [...mobileDrawerRef.current.querySelectorAll("button, a, input, select, textarea")]
        .filter((element) => !element.disabled && element.tabIndex !== -1);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMobileNavigation, open]);

  return (
    <div className="glass-theme theme-bg ats-operating-shell min-h-screen text-slate-950">
      <aside className="ats-workspace-sidebar">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="ats-workspace-brand"
        >
          <BrandMark className="h-9 w-9" compact />
          <span>
            <span className="ats-workspace-brand-name">
              ATSmind AI
            </span>
            <span className="ats-workspace-brand-meta">Resume intelligence</span>
          </span>
        </button>

        <NavList items={navItems} />

        <div className="ats-workspace-sidebar-footer">
          <div className="ats-workspace-context">
            <p className="ats-workspace-context-label">
              {workspaceLabel}
            </p>
            <p className="ats-workspace-context-copy">
              Evidence-based resume and recruitment evaluation.
            </p>
          </div>
          <UserBlock user={user} onLogout={handleLogout} />
        </div>
      </aside>

      {open && (
        <div className="ats-workspace-mobile-layer">
          <button
            type="button"
            className="ats-workspace-mobile-backdrop"
            onClick={closeMobileNavigation}
            aria-label="Close navigation overlay"
          />
          <div ref={mobileDrawerRef} className="ats-workspace-mobile-drawer" role="dialog" aria-modal="true" aria-label="Workspace navigation">
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="ats-workspace-mobile-brand"
              >
                <BrandMark className="h-9 w-9" compact />
                <span>ATSmind AI</span>
              </button>
              <button
                type="button"
                onClick={closeMobileNavigation}
                className="ats-workspace-mobile-close"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <NavList items={navItems} onNavigate={closeMobileNavigation} />
            <div className="mt-auto">
              <UserBlock user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      )}

      <div className="ats-workspace-canvas">
        <header className="ats-workspace-command-bar">
          <div className="ats-workspace-command-inner">
            <div className="flex min-w-0 items-center gap-3">
              <button
                ref={mobileTriggerRef}
                type="button"
                onClick={() => setOpen(true)}
                className="ats-workspace-mobile-trigger"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <h1 className="ats-workspace-title">
                  {title}
                </h1>
                {description && (
                  <p className="ats-workspace-description hidden md:block">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        </header>

        <main className="ats-workspace-content">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
