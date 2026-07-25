import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  Lightbulb,
  ShieldX,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import ScoreRing from "./ScoreRing";
import { compactFileName, formatDateTime, normalizeAnalysis } from "../utils/analysis";

const SectionCard = ({ title, icon: Icon, tone = "slate", children }) => {
  const tones = {
    green: "text-emerald-600",
    amber: "text-amber-500",
    red: "text-red-500",
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
    return <p className="text-xs leading-relaxed text-slate-500">No items available.</p>;
  }

  return (
    <ul className={`list-disc space-y-2 pl-4 text-xs leading-relaxed text-slate-600 ${colors[tone]}`}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
};

const SkillPills = ({ items, tone = "slate" }) => {
  const styles = {
    slate: "border-teal-200/50 bg-teal-50/60 text-teal-800",
    red: "border-red-200/70 bg-red-50/70 text-red-700",
  };

  if (!items.length) {
    return <p className="text-xs leading-relaxed text-slate-500">No skills available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${styles[tone]}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
};

const AnalysisDetailModal = ({ analysis, onClose }) => {
  const normalized = normalizeAnalysis(analysis);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!normalized) return null;

  const handleExport = async () => {
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
          addText(content.length ? content.map((item) => `- ${item}`).join("\n") : "No items available.");
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
      addText(`${normalized.fileName} | ATS Score: ${normalized.atsScore.score}%`, {
        size: 11,
        color: [37, 99, 235],
      });
      addSection("Summary", normalized.summary);
      addSection("Strengths", normalized.strengths);
      addSection("Weaknesses", normalized.weaknesses);
      addSection("Skills Detected", normalized.skillsDetected.join(", "));
      addSection("Missing Skills", normalized.missingSkills.join(", "));
      addSection("Experience Analysis", normalized.experienceAnalysis);
      addSection("Improvement Suggestions", normalized.suggestions);

      doc.save(`${baseName || "resume"}-analysis.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-10 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="liquid-glass-strong w-full max-w-3xl rounded-3xl p-5">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 truncate text-sm font-semibold text-slate-950">
              <FileText size={17} className="text-teal-700" />
              <span className="truncate">{compactFileName(normalized.fileName)}</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Analyzed on {formatDateTime(normalized.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 transition hover:bg-white/40 hover:text-slate-950"
            aria-label="Close analysis details"
          >
            <X size={17} />
          </button>
        </header>

        <div className="space-y-4">
          <section className="liquid-glass grid gap-6 rounded-2xl p-6 md:grid-cols-[150px_1fr] md:items-center">
            <ScoreRing
              score={normalized.atsScore.score}
              size={132}
              strokeWidth={9}
              label="ATS Score"
            />

            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-950">Summary</h3>
              <p className="text-xs leading-6 text-slate-600">{normalized.summary}</p>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <SectionCard title="Strengths" icon={CheckCircle2} tone="green">
              <BulletList items={normalized.strengths} tone="green" />
            </SectionCard>

            <SectionCard title="Weaknesses" icon={AlertTriangle} tone="amber">
              <BulletList items={normalized.weaknesses} tone="amber" />
            </SectionCard>

            <SectionCard title="Skills Detected" icon={Zap} tone="violet">
              <SkillPills items={normalized.skillsDetected} />
            </SectionCard>

            <SectionCard title="Missing Skills" icon={ShieldX} tone="red">
              <SkillPills items={normalized.missingSkills} tone="red" />
            </SectionCard>
          </div>

          <SectionCard title="Experience Analysis" icon={Sparkles} tone="blue">
            <p className="text-xs leading-6 text-slate-600">
              {normalized.experienceAnalysis}
            </p>
          </SectionCard>

          <SectionCard title="Improvement Suggestions" icon={Lightbulb} tone="amber">
            <ol className="list-decimal space-y-2 pl-4 text-xs leading-relaxed text-slate-600 marker:text-teal-500">
              {normalized.suggestions.length ? (
                normalized.suggestions.map((suggestion, index) => (
                  <li key={`${suggestion}-${index}`}>{suggestion}</li>
                ))
              ) : (
                <li>No suggestions available.</li>
              )}
            </ol>
          </SectionCard>
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="liquid-button-primary liquid-shine inline-flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={14} />
            {exporting ? "Exporting..." : "Export as PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailModal;
