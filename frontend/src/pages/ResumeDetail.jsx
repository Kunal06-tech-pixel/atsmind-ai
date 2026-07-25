import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Lightbulb,
  Loader2,
  ShieldX,
  Sparkles,
  Zap,
} from "lucide-react";
import ScoreRing from "../components/ScoreRing";
import FloatingChatButton from "../components/FloatingChatButton";
import AppShell from "../components/ui/AppShell";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import { useToast } from "../components/ui/useToast";
import api from "../services/axios";
import {
  compactFileName,
  formatDateTime,
  normalizeAnalysis,
} from "../utils/analysis";
import { analysisToOptimizationContext } from "../utils/builder";

const tabs = [
  { label: "Overview", value: "overview" },
  { label: "Skills", value: "skills" },
  { label: "Suggestions", value: "suggestions" },
];

const SectionCard = ({ title, icon: Icon, tone = "slate", children }) => {
  const tones = {
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
    blue: "text-blue-600",
    violet: "text-violet-600",
    slate: "text-slate-600",
  };

  return (
    <section className="liquid-glass rounded-2xl p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
        {Icon && <Icon size={17} className={tones[tone]} />}
        {title}
      </h3>
      {children}
    </section>
  );
};

const BulletList = ({ items, tone = "slate" }) => {
  const colors = {
    green: "marker:text-emerald-500",
    amber: "marker:text-amber-500",
    red: "marker:text-red-500",
    violet: "marker:text-violet-500",
    slate: "marker:text-slate-400",
  };

  if (!items.length) {
    return <p className="text-sm leading-6 text-slate-500">No items available.</p>;
  }

  return (
    <ul className={`list-disc space-y-2 pl-4 text-sm leading-6 text-slate-600 ${colors[tone]}`}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
};

const SkillPills = ({ items, tone = "slate" }) => {
  const styles = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    red: "border-red-200 bg-red-50 text-red-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  if (!items.length) {
    return <p className="text-sm leading-6 text-slate-500">No skills available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className={`rounded-md border px-2.5 py-1 text-sm font-medium ${styles[tone]}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
};

const LoadingState = () => (
  <AppShell title="Analysis detail" description="Loading saved report">
    <div className="mx-auto max-w-6xl">
      <div className="liquid-glass flex items-center justify-center rounded-2xl py-20">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-slate-500" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading analysis...
          </p>
        </div>
      </div>
    </div>
  </AppShell>
);

const ResumeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let active = true;

    const loadAnalysis = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get(`/api/resume/analyses/${id}`);

        if (!active) return;

        setAnalysis(res.data.analysis);
      } catch (err) {
        if (!active) return;
        console.error("Load analysis error:", err);
        setError("Could not load this analysis.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAnalysis();

    return () => {
      active = false;
    };
  }, [id]);

  const normalized = normalizeAnalysis(analysis);

  const handleOptimizeInBuilder = () => {
    if (!normalized) return;

    navigate("/builder", {
      state: {
        optimizationContext: analysisToOptimizationContext(normalized),
      },
    });
  };

  const handleExport = async () => {
    if (!normalized) return;

    const baseName = normalized.fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);

    setExporting(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const margin = 48;
      const maxWidth = 516;
      let y = 48;

      const addText = (text, options = {}) => {
        const {
          size = 10,
          style = "normal",
          color = [71, 85, 105],
          gap = 14,
        } = options;

        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        doc.setTextColor(...color);

        const lines = doc.splitTextToSize(String(text || ""), maxWidth);

        if (y + lines.length * (size + 4) > 742) {
          doc.addPage();
          y = 48;
        }

        doc.text(lines, margin, y);
        y += lines.length * (size + 4) + gap;
      };

      const addSection = (title, content) => {
        addText(title, {
          size: 12,
          style: "bold",
          color: [15, 23, 42],
          gap: 8,
        });

        if (Array.isArray(content)) {
          addText(
            content.length
              ? content.map((item) => `- ${item}`).join("\n")
              : "No items available."
          );
          return;
        }

        addText(content || "No content available.");
      };

      addText("Resume Analysis Report", {
        size: 18,
        style: "bold",
        color: [15, 23, 42],
        gap: 8,
      });
      addText(
        `${normalized.fileName} | ATS Score: ${normalized.atsScore.score}%`,
        {
          size: 11,
          color: [37, 99, 235],
        }
      );
      addSection("Summary", normalized.summary);
      addSection("Strengths", normalized.strengths);
      addSection("Weaknesses", normalized.weaknesses);
      addSection("Skills Detected", normalized.skillsDetected.join(", "));
      addSection("Missing Skills", normalized.missingSkills.join(", "));
      addSection("Experience Analysis", normalized.experienceAnalysis);
      addSection("Improvement Suggestions", normalized.suggestions);

      doc.save(`${baseName || "resume"}-analysis.pdf`);
      toast.success("The analysis PDF has been exported.");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export this analysis.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingState />;

  if (error || !analysis || !normalized) {
    return (
      <AppShell title="Analysis detail" description="Saved report">
        <div className="liquid-glass mx-auto max-w-3xl rounded-2xl p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200/70 bg-red-50/70 text-red-600 backdrop-blur-xl">
            <AlertTriangle size={22} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-950">
            {error || "Analysis not found"}
          </h3>
          <SecondaryButton onClick={() => navigate("/dashboard")} className="mt-5">
            <ArrowLeft size={16} />
            Back to Dashboard
          </SecondaryButton>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={compactFileName(normalized.fileName)}
      description={`Analyzed on ${formatDateTime(normalized.createdAt)}`}
      actions={
        <>
          <SecondaryButton onClick={() => navigate("/dashboard")} className="hidden sm:inline-flex">
            <ArrowLeft size={16} />
            Dashboard
          </SecondaryButton>
          <SecondaryButton onClick={handleOptimizeInBuilder}>
            <Sparkles size={16} />
            Optimize
            <ArrowRight size={16} />
          </SecondaryButton>
          <PrimaryButton onClick={handleExport} disabled={exporting}>
            <Download size={16} />
            {exporting ? "Exporting..." : "Export"}
          </PrimaryButton>
        </>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="liquid-glass-strong rounded-2xl p-6">
          <div className="grid gap-6 lg:grid-cols-[12rem_1fr] lg:items-center">
            <div className="liquid-pill rounded-2xl p-5">
              <ScoreRing
                score={normalized.atsScore.score}
                size={132}
                strokeWidth={9}
                label="ATS Score"
              />
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="liquid-pill inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  <FileText size={13} />
                  Saved report
                </span>
                {normalized.atsScore.level && (
                  <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {normalized.atsScore.level} fit
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Resume analysis report
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {normalized.summary}
              </p>
            </div>
          </div>
        </section>

        <div className="liquid-segmented flex overflow-x-auto rounded-2xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.value
                  ? "liquid-pill text-slate-950"
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Strengths" icon={CheckCircle2} tone="green">
              <BulletList items={normalized.strengths} tone="green" />
            </SectionCard>

            <SectionCard title="Weaknesses" icon={AlertTriangle} tone="amber">
              <BulletList items={normalized.weaknesses} tone="amber" />
            </SectionCard>

            <div className="lg:col-span-2">
              <SectionCard title="Experience Analysis" icon={Sparkles} tone="blue">
                <p className="text-sm leading-7 text-slate-600">
                  {normalized.experienceAnalysis}
                </p>
              </SectionCard>
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Skills Detected" icon={Zap} tone="green">
              <SkillPills items={normalized.skillsDetected} tone="green" />
            </SectionCard>

            <SectionCard title="Missing Skills" icon={ShieldX} tone="red">
              <SkillPills items={normalized.missingSkills} tone="red" />
            </SectionCard>
          </div>
        )}

        {activeTab === "suggestions" && (
          <SectionCard title="Improvement Suggestions" icon={Lightbulb} tone="amber">
            <ol className="list-decimal space-y-3 pl-5 text-sm leading-7 text-slate-600 marker:font-semibold marker:text-slate-400">
              {normalized.suggestions.length ? (
                normalized.suggestions.map((suggestion, index) => (
                  <li key={`${suggestion}-${index}`}>{suggestion}</li>
                ))
              ) : (
                <li>No suggestions available.</li>
              )}
            </ol>
          </SectionCard>
        )}
      </div>

      <FloatingChatButton analysisId={id} fileName={normalized.fileName} />
    </AppShell>
  );
};

export default ResumeDetail;
