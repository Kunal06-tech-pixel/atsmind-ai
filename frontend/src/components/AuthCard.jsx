import { useEffect, useState } from "react";
import api from "../services/axios";
import { useAuth } from "../context/useAuth";
import { useLocation } from "react-router-dom";
import { PrimaryButton } from "./ui/Buttons";
import { inputClass, labelClass } from "../utils/uiClasses";
import { useToast } from "./ui/useToast";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Mail,
  Shield,
  UserRound,
} from "lucide-react";

const AuthCard = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "job_seeker",
    companyName: "",
    designation: "",
    companyWebsite: "",
  });

  useEffect(() => {
    if (location.state?.mode === "signup") {
      setIsLogin(false);
    } else if (location.state?.mode === "login") {
      setIsLogin(true);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post("/api/auth/login", {
          email: form.email,
          password: form.password,
        });

        setUser(res.data.user);
      } else {
        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const res = await api.post("/api/auth/signup", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          companyProfile: {
            companyName: form.companyName,
            designation: form.designation,
            companyWebsite: form.companyWebsite,
          },
        });

        toast.success("Your account is ready.");
        setUser(res.data.user);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ats-auth-card liquid-glass-strong w-full max-w-md rounded-3xl p-8">
      <div className="mb-7">
        <div className="liquid-pill mb-5 flex h-11 w-11 items-center justify-center rounded-2xl text-slate-700">
          <Shield size={20} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {isLogin ? "Welcome back" : "Create workspace"}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {isLogin
            ? "Log in to continue improving your resume workspace."
            : "Sign up to analyze, improve, and export your resume."}
        </p>
      </div>

      {error && (
        <div id="auth-form-error" role="alert" aria-live="polite" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200/70 bg-red-50/70 px-3 py-2 text-sm text-red-700 backdrop-blur-xl">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin && (
          <div>
            <label className={labelClass} htmlFor="auth-name">Full Name</label>
            <input
              id="auth-name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              className={inputClass}
              onChange={handleChange}
              value={form.name}
              autoComplete="name"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "auth-form-error" : undefined}
            />
          </div>
        )}

        {!isLogin && (
          <div>
            <p id="account-type-label" className={labelClass}>How do you want to use ATSmind?</p>
            <div className="grid gap-3 sm:grid-cols-2" role="group" aria-labelledby="account-type-label">
              {[
                {
                  value: "job_seeker",
                  title: "Job Seeker",
                  description: "Analyse, improve and build my resume.",
                  icon: UserRound,
                },
                {
                  value: "recruiter",
                  title: "Recruiter",
                  description: "Evaluate and compare candidate resumes.",
                  icon: Briefcase,
                },
              ].map((option) => {
                const Icon = option.icon;
                const active = form.role === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setForm({ ...form, role: option.value })}
                    className={`ats-role-option${active ? " is-active" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={17} />
                      <span className="text-sm font-semibold">
                        {option.title}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!isLogin && form.role === "recruiter" && (
          <div className="grid gap-4">
            <div>
              <label className={labelClass} htmlFor="auth-company-name">Company Name</label>
              <input
                id="auth-company-name"
                name="companyName"
                type="text"
                placeholder="Company name"
                className={inputClass}
                onChange={handleChange}
                value={form.companyName}
                autoComplete="organization"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "auth-form-error" : undefined}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="auth-designation">Designation</label>
              <input
                id="auth-designation"
                name="designation"
                type="text"
                placeholder="Talent partner"
                className={inputClass}
                onChange={handleChange}
                value={form.designation}
                autoComplete="organization-title"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "auth-form-error" : undefined}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="auth-company-website">Company Website</label>
              <input
                id="auth-company-website"
                name="companyWebsite"
                type="url"
                placeholder="https://company.com"
                className={inputClass}
                onChange={handleChange}
                value={form.companyWebsite}
                autoComplete="url"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "auth-form-error" : undefined}
              />
            </div>
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="auth-email">Email Address</label>
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="auth-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              className={`${inputClass} pl-9`}
              onChange={handleChange}
              value={form.email}
              autoComplete="email"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "auth-form-error" : undefined}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            className={inputClass}
            onChange={handleChange}
            value={form.password}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "auth-form-error" : undefined}
          />
        </div>

        {!isLogin && (
          <div>
            <label className={labelClass} htmlFor="auth-confirm-password">Confirm Password</label>
            <input
              id="auth-confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className={inputClass}
              onChange={handleChange}
              value={form.confirmPassword}
              autoComplete="new-password"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "auth-form-error" : undefined}
            />
          </div>
        )}

        <PrimaryButton type="submit" disabled={loading} className="mt-5 w-full">
          {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
          {!loading && <ArrowRight size={16} />}
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-950"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
};

export default AuthCard;
