import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  FileSearch,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import BrandMark from "./BrandMark";
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

const publicNavItems = [
  { label: "Solutions", to: "#solutions" },
  { label: "Evidence", to: "#evidence" },
  { label: "Career", to: "#workspaces" },
  { label: "Recruit", to: "#workspaces" },
  { label: "Trust", to: "#trust" },
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
  const reduceMotion = useReducedMotion();
  const navItems = getNavItems(user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const isPublicLanding = location.pathname === "/" && !user;

  const goToLogin = () => {
    setMobileMenuOpen(false);
    navigate("/login", { state: { mode: "login" } });
  };
  const goToSignup = () => {
    setMobileMenuOpen(false);
    navigate("/login", { state: { mode: "signup" } });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const firstLink = mobileMenuRef.current?.querySelector("a, button");
    firstLink?.focus({ preventScroll: true });

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setMobileMenuOpen(false);
      mobileToggleRef.current?.focus({ preventScroll: true });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  if (isPublicLanding) {
    return (
      <Motion.nav
        className="ats-public-nav-wrap"
        aria-label="Primary navigation"
        initial={reduceMotion ? false : { opacity: 0, transform: "translateY(-0.625rem)" }}
        animate={{ opacity: 1, transform: "translateY(0)" }}
        transition={{ duration: reduceMotion ? 0.18 : 0.6, ease: "easeOut" }}
      >
        <div className="ats-public-nav">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}
            className="ats-nav-brand"
            aria-label="ATSmind AI home"
          >
            <BrandMark className="h-8 w-8" compact />
          </button>

          <div className="ats-nav-links" aria-label="Landing page sections">
            {publicNavItems.map((item, index) => (
              <Motion.a
                key={`${item.to}-${item.label}`}
                href={item.to}
                initial={reduceMotion ? false : { opacity: 0, transform: "translateY(-0.5rem)" }}
                animate={{ opacity: 1, transform: "translateY(0)" }}
                transition={{ duration: reduceMotion ? 0.15 : 0.45, delay: reduceMotion ? 0 : 0.1 + index * 0.05, ease: "easeOut" }}
              >
                {item.label}
              </Motion.a>
            ))}
          </div>

          <div className="ats-nav-actions">
            <button
              type="button"
              className="ats-nav-start"
              onClick={goToSignup}
            >
              <FileSearch size={16} aria-hidden="true" />
              Get started
              <ChevronRight size={15} aria-hidden="true" />
            </button>
            <button
              ref={mobileToggleRef}
              type="button"
              className="ats-nav-menu-button"
              aria-expanded={mobileMenuOpen}
              aria-controls="ats-mobile-menu"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <Motion.div
                ref={mobileMenuRef}
                id="ats-mobile-menu"
                className="ats-mobile-menu"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(-0.5rem) scale(0.98)" }}
                animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(-0.25rem) scale(0.99)" }}
                transition={{ duration: reduceMotion ? 0.12 : 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                {publicNavItems.map((item) => (
                  <a key={`${item.to}-${item.label}`} href={item.to} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </a>
                ))}
                <button type="button" onClick={goToLogin}>Log in</button>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </Motion.nav>
    );
  }

  return (
    <nav className="ats-standalone-nav">
      <div className="ats-standalone-nav-inner">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="ats-standalone-brand"
        >
          <BrandMark className="h-8 w-8" compact />
          ATSmind AI
        </button>

        {user ? (
          <div className="ats-standalone-route-list hidden md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;

              return (
                <button
                  key={item.to}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => navigate(item.to)}
                  className={active ? "is-active" : ""}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="ats-standalone-nav-context hidden md:block">
            Evidence-first resume intelligence
          </p>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="ats-standalone-account hidden sm:inline">
                {user.name || user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="ats-standalone-action is-primary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={goToLogin}
                className="ats-standalone-action"
              >
                Login
              </button>
              <button
                type="button"
                onClick={goToSignup}
                className="ats-standalone-action is-primary"
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
