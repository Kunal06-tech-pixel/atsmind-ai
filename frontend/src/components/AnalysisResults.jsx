import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  FileText,
  Lightbulb,
  ShieldX,
  Sparkles,
  Zap,
} from "lucide-react";
import ScoreRing from "./ScoreRing";
import { normalizeAnalysis } from "../utils/analysis";
import { analysisToOptimizationContext } from "../utils/builder";
import FloatingChatButton from "./FloatingChatButton";
import { PrimaryButton } from "./ui/Buttons";

const tabs = [
  { label: "Overview", value: "overview" },
  { label: "Skills", value: "skills" },
  { label: "Suggestions", value: "suggestions" },
];

const PillList = ({ items, tone = "slate" }) => {
  const styles = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  if (!items.length) {
    return <p className="text-sm text-slate-500">No items available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-md border px-2.5 py-1 text-sm font-medium ${styles[tone]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
};

const InsightCard = ({ title, icon: Icon, children, tone = "slate" }) => {
  const iconStyles = {
    slate: "text-slate-600",
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
    blue: "text-blue-600",
  };

  return (
    <section className="liquid-glass rounded-2xl p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
        {Icon && <Icon size={17} className={iconStyles[tone]} />}
        {title}
      </h3>
      {children}
    </section>
  );
};

const BulletList = ({ items, tone = "slate" }) => {
  const marker = {
    slate: "marker:text-slate-400",
    green: "marker:text-emerald-500",
    amber: "marker:text-amber-500",
    red: "marker:text-red-500",
  };

  if (!items.length) {
    return <p className="text-sm leading-6 text-slate-500">No items available.</p>;
  }

  return (
    <ul className={`list-disc space-y-2 pl-4 text-sm leading-6 text-slate-600 ${marker[tone]}`}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
};

const AnalysisResults = ({ data }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const analysis = normalizeAnalysis(data);

  if (!analysis) return null;

  const handleOptimizeInBuilder = () => {
    navigate("/builder", {
      state: {
        optimizationContext: analysisToOptimizationContext(analysis),
      },
    });
  };

  return (
    <div className="space-y-6">
      <section className="liquid-glass-strong rounded-2xl p-6">
        <div className="grid gap-6 lg:grid-cols-[12rem_1fr] lg:items-center">
          <div className="liquid-pill rounded-2xl p-5">
            <ScoreRing
              score={analysis.atsScore.score}
              size={132}
              strokeWidth={9}
              label="ATS Score"
            />
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="liquid-pill inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                <FileText size={13} />
                Analysis report
              </span>
              {analysis.atsScore.level && (
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {analysis.atsScore.level} fit
                </span>
              )}
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Resume analysis complete
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {analysis.summary}
            </p>
            <div className="mt-5">
              <PrimaryButton onClick={handleOptimizeInBuilder}>
                <Sparkles size={16} />
                Optimize in Builder
                <ArrowRight size={16} />
              </PrimaryButton>
            </div>
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
          {analysis.scoringMethod && (
            <section className="liquid-glass rounded-2xl p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-slate-950">Local score breakdown</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Skill match", analysis.skillScore],
                  ["Semantic", analysis.semanticScore],
                  ["Keywords", analysis.keywordScore],
                  ["Resume quality", analysis.resumeQualityScore],
                ].map(([label, value]) => (
                  <div key={label} className="liquid-pill rounded-xl p-3">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">{value}%</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {analysis.scoringMethod}. Groq is used only for improvement suggestions.
              </p>
            </section>
          )}

          <InsightCard title="Strengths" icon={CheckCircle2} tone="green">
            <BulletList items={analysis.strengths} tone="green" />
          </InsightCard>

          <InsightCard title="Weaknesses" icon={AlertTriangle} tone="amber">
            <BulletList items={analysis.weaknesses} tone="amber" />
          </InsightCard>

          <div className="lg:col-span-2">
            <InsightCard title="Experience Analysis" icon={Sparkles} tone="blue">
              <p className="text-sm leading-7 text-slate-600">
                {analysis.experienceAnalysis}
              </p>
            </InsightCard>
          </div>
        </div>
      )}

      {activeTab === "skills" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <InsightCard title="Skills Detected" icon={Zap} tone="green">
            <PillList items={analysis.skillsDetected} tone="green" />
          </InsightCard>

          <InsightCard title="Missing Skills" icon={ShieldX} tone="red">
            <PillList items={analysis.missingSkills} tone="red" />
          </InsightCard>
        </div>
      )}

      {activeTab === "suggestions" && (
        <InsightCard title="Improvement Suggestions" icon={Lightbulb} tone="amber">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-7 text-slate-600 marker:font-semibold marker:text-slate-400">
            {analysis.suggestions.length ? (
              analysis.suggestions.map((suggestion, index) => (
                <li key={`${suggestion}-${index}`}>{suggestion}</li>
              ))
            ) : (
              <li>No suggestions available.</li>
            )}
          </ol>
        </InsightCard>
      )}

      <FloatingChatButton analysisId={analysis.id} fileName={analysis.fileName} />
    </div>
  );
};

export default AnalysisResults;
