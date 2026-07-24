import { useEffect, useState } from "react";
import api from "../services/axios";
import { useAuth } from "../context/useAuth";
import { useLocation } from "react-router-dom";
import { PrimaryButton } from "./ui/Buttons";
import { inputClass, labelClass } from "../utils/uiClasses";
import { useToast } from "./ui/useToast";
import { AlertCircle, ArrowRight, Mail, Shield } from "lucide-react";

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

        await api.post("/api/auth/signup", {
          name: form.name,
          email: form.email,
          password: form.password,
        });

        toast.success("Your account is ready. Log in to continue.");
        setIsLogin(true);
        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
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
    <div className="liquid-glass-strong w-full max-w-md rounded-3xl p-8">
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
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200/70 bg-red-50/70 px-3 py-2 text-sm text-red-700 backdrop-blur-xl">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin && (
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              name="name"
              type="text"
              placeholder="Enter your full name"
              className={inputClass}
              onChange={handleChange}
              value={form.name}
            />
          </div>
        )}

        <div>
          <label className={labelClass}>Email Address</label>
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="email"
              type="email"
              placeholder="you@company.com"
              className={`${inputClass} pl-9`}
              onChange={handleChange}
              value={form.email}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter your password"
            className={inputClass}
            onChange={handleChange}
            value={form.password}
          />
        </div>

        {!isLogin && (
          <div>
            <label className={labelClass}>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className={inputClass}
              onChange={handleChange}
              value={form.confirmPassword}
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
