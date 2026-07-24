import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import PageShell from "../components/ui/PageShell";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Download,
  Edit3,
  Eye,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";

const SparkleDot = () => (
  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-50/70 text-teal-700">
    <Sparkles size={13} />
  </span>
);

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    { title: "Local analysis", icon: Brain, copy: "Embedding-assisted skills, ATS scoring, gaps, and AI suggestions in one report." },
    { title: "ATS compatibility", icon: ShieldCheck, copy: "A clear score and keyword signals show exactly where the resume stands." },
    { title: "Job matching", icon: Target, copy: "Compare resume content against a target role and job description." },
    { title: "Resume builder", icon: FileText, copy: "Create a polished PDF from guided, recruiter-friendly sections." },
  ];

  const goToLogin = () => navigate("/login", { state: { mode: "login" } });
  const goToSignup = () => navigate("/login", { state: { mode: "signup" } });

  return (
    <PageShell>
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-10 pt-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pt-8">
        <div>
          <div className="liquid-pill mb-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
            <SparkleDot />
            AI resume operating system
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Analyze, improve, and ship a{" "}
            <span className="teal-text-gradient">stronger resume.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            ATSmind AI gives candidates a polished workspace for resume scoring,
            job-fit analysis, AI suggestions, and PDF-ready resume building.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton
              onClick={() =>
                navigate(
                  user ? "/analyzer" : "/login",
                  user ? {} : { state: { mode: "login" } }
                )
              }
            >
              Analyze Resume
              <ArrowRight size={16} />
            </PrimaryButton>

            <SecondaryButton
              onClick={() =>
                navigate(
                  user ? "/builder" : "/login",
                  user ? {} : { state: { mode: "signup" } }
                )
              }
            >
              Open Builder
            </SecondaryButton>
          </div>

          <div className="liquid-glass mt-10 grid max-w-xl grid-cols-3 gap-4 rounded-3xl p-4">
            {[
              ["50", "saved reports"],
              ["PDF", "resume export"],
              ["AI", "job feedback"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">
                  {value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="liquid-glass-strong rounded-3xl p-5">
            <div className="liquid-glass rounded-3xl">
              <div className="liquid-divider flex items-center justify-between border-b bg-white/24 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="liquid-pill rounded-xl px-3 py-2 text-xs font-semibold text-teal-800">
                  ats-report.pdf
                </span>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[12rem_1fr]">
                <div className="liquid-glass space-y-3 rounded-2xl p-3">
                  {["Dashboard", "Analyzer", "Builder"].map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-lg px-3 py-2 text-sm font-medium ${
                        index === 1
                          ? "liquid-button-primary text-white"
                          : "liquid-pill text-slate-500"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["86", "ATS score"],
                      ["24", "skills found"],
                      ["7", "fixes"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="liquid-pill rounded-2xl p-4"
                      >
                        <p className="text-2xl font-semibold text-slate-950">
                          {value}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="liquid-pill rounded-2xl p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Product Designer Resume
                        </p>
                        <p className="text-xs text-slate-500">
                          Role match analysis
                        </p>
                      </div>
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        High match
                      </span>
                    </div>
                    <div className="space-y-2">
                      {[88, 72, 58].map((width, index) => (
                        <div key={width}>
                          <div className="mb-1 flex justify-between text-xs text-slate-500">
                            <span>{["Keywords", "Experience", "Formatting"][index]}</span>
                            <span>{width}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-teal-950/10">
                            <div
                              className="h-2 rounded-full bg-slate-950"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="liquid-pill rounded-2xl p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Suggestions
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        Add measurable outcomes to recent project bullets.
                      </p>
                    </div>
                    <div className="liquid-pill rounded-2xl p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Missing skills
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {["SQL", "A/B testing", "Roadmaps"].map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-teal-200/50 bg-teal-50/55 px-2 py-1 text-xs font-medium text-teal-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/50 bg-white/25 px-4 py-20 backdrop-blur-2xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                Platform
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950">
                Everything needed to turn a resume into an interview-ready asset.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              Focused workflows for analyzing, editing, and exporting without
              leaving the product.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="liquid-glass liquid-hover rounded-2xl p-6"
              >
                <div className="liquid-pill mb-5 flex h-10 w-10 items-center justify-center rounded-xl text-teal-800">
                  <Icon size={20} />
                </div>

                <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.copy}
                </p>
              </div>
            );
          })}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-3xl font-semibold tracking-tight text-slate-950">
            How it works
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="liquid-glass rounded-2xl p-6">
            <h3 className="mb-6 text-lg font-semibold text-slate-950">
              Resume Analyzer
            </h3>

            <div className="relative mb-8 flex items-center justify-between">
              <div className="absolute left-0 right-0 top-5 h-px bg-teal-800/15" />

              {[
                { label: "Upload", icon: Upload },
                { label: "Analyze", icon: Brain },
                { label: "Score", icon: CheckCircle },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.label}
                    className="group relative z-10 flex flex-col items-center gap-2"
                  >
                    <div className="liquid-pill flex h-10 w-10 items-center justify-center rounded-xl text-teal-800 transition group-hover:-translate-y-0.5 group-hover:border-teal-200">
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 transition group-hover:text-slate-950">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <PrimaryButton
              onClick={() => (user ? navigate("/analyzer") : goToLogin())}
              className="w-full"
            >
              Analyze Your Resume
              <ArrowRight size={16} />
            </PrimaryButton>
          </div>

          <div className="liquid-glass rounded-2xl p-6">
            <h3 className="mb-6 text-lg font-semibold text-slate-950">
              Resume Builder
            </h3>

            <div className="relative mb-8 flex items-center justify-between">
              <div className="absolute left-0 right-0 top-5 h-px bg-teal-800/15" />

              {[
                { label: "Fill", icon: Edit3 },
                { label: "Preview", icon: Eye },
                { label: "Download", icon: Download },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.label}
                    className="group relative z-10 flex flex-col items-center gap-2"
                  >
                    <div className="liquid-pill flex h-10 w-10 items-center justify-center rounded-xl text-teal-800 transition group-hover:-translate-y-0.5 group-hover:border-teal-200">
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 transition group-hover:text-slate-950">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <SecondaryButton
              onClick={() => (user ? navigate("/builder") : goToSignup())}
              className="w-full"
            >
              Build Your Resume
              <ArrowRight size={16} />
            </SecondaryButton>
          </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/50 bg-white/25 py-6 text-center text-xs text-slate-400 backdrop-blur-xl">
        Copyright 2026 ATSmind AI. All rights reserved.
      </footer>
    </PageShell>
  );
}
