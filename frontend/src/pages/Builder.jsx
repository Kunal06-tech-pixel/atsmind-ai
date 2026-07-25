import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Download,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import ResumePDF from "../components/pdf/ResumePDF";
import Stepper from "../components/builder/Stepper";
import ResumePreview from "../components/builder/ResumePreview";
import PersonalInfoForm from "../components/builder/forms/PersonalInfoForm";
import ExperienceForm from "../components/builder/forms/ExperienceForm";
import EducationForm from "../components/builder/forms/EducationForm";
import ProjectsForm from "../components/builder/forms/ProjectsForm";
import SkillsForm from "../components/builder/forms/SkillsForm";
import AppShell from "../components/ui/AppShell";
import GlassCard from "../components/ui/GlassCard";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import { useToast } from "../components/ui/useToast";
import ScoreRing from "../components/ScoreRing";
import api from "../services/axios";
import { compactFileName, normalizeAnalysis } from "../utils/analysis";
import {
  builderDataToResumeText,
  clearStoredOptimizationContext,
  createDefaultResumeData,
  mergeUniqueStrings,
  readStoredOptimizationContext,
  storeOptimizationContext,
} from "../utils/builder";

const scoreBadgeClass = (score) => {
  if (score >= 75) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 45) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-700";
};

const PillList = ({ items, onAddSkill }) => {
  if (!items.length) {
    return <p className="text-sm text-slate-500">No items available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-sm font-medium text-red-700"
        >
          {item}
          {onAddSkill && (
            <button
              type="button"
              onClick={() => onAddSkill(item)}
              className="rounded-sm text-red-500 transition hover:text-red-800"
              aria-label={`Add ${item} to technical skills`}
            >
              <Plus size={13} />
            </button>
          )}
        </span>
      ))}
    </div>
  );
};

const BulletList = ({ items }) => {
  if (!items.length) {
    return <p className="text-sm leading-6 text-slate-500">No items available.</p>;
  }

  return (
    <ul className="list-disc space-y-2 pl-4 text-sm leading-6 text-slate-600 marker:text-amber-500">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
};

const OptimizationBrief = ({ context, onAddSkill, onClear }) => {
  if (!context) return null;

  const missingItems = [
    ...(context.missingSkills || []),
    ...(context.missingKeywords || []),
  ]
    .filter(Boolean)
    .filter(
      (item, index, array) =>
        array.findIndex(
          (candidate) => candidate.toLowerCase() === item.toLowerCase()
        ) === index
    );

  return (
    <section className="liquid-glass-strong rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <Sparkles size={14} />
            Optimization brief
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            Tune this resume for {context.jobTitle || "the target role"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {context.companyName ? `${context.companyName} - ` : ""}
            {context.sourceFileName
              ? `Based on ${compactFileName(context.sourceFileName)}`
              : "Based on your latest analysis"}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-semibold ${scoreBadgeClass(
              context.previousScore || 0
            )}`}
          >
            Previous ATS {context.previousScore || 0}%
          </span>
          <SecondaryButton onClick={onClear} className="min-h-9 px-3 py-1.5">
            <X size={15} />
            Clear brief
          </SecondaryButton>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="liquid-glass rounded-xl p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Target size={16} className="text-blue-600" />
            Missing keywords
          </h3>
          <PillList items={missingItems} onAddSkill={onAddSkill} />
        </div>

        <div className="liquid-glass rounded-xl p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <AlertTriangle size={16} className="text-amber-600" />
            Recommended edits
          </h3>
          <BulletList items={context.suggestions || []} />
        </div>
      </div>

      {context.jobDescription && (
        <details className="liquid-pill mt-4 rounded-xl p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">
            View target job description
          </summary>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {context.jobDescription}
          </p>
        </details>
      )}
    </section>
  );
};

const DraftFitPanel = ({ analysis, loading, onCheck }) => {
  const normalized = normalizeAnalysis(analysis);

  return (
    <div className="liquid-glass rounded-2xl p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <Zap size={14} />
            Draft fit
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
            ATS check
          </h2>
        </div>
        <PrimaryButton onClick={onCheck} disabled={loading} className="min-h-9 px-3 py-1.5">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          {loading ? "Checking" : "Check"}
        </PrimaryButton>
      </div>

      {normalized ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ScoreRing
              score={normalized.atsScore.score}
              size={74}
              strokeWidth={6}
              label="ATS"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950">
                {normalized.atsScore.level || "Draft"} fit
              </p>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">
                {normalized.summary}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-950">
              Still missing
            </p>
            <PillList items={normalized.missingSkills} />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-950">
              Next improvements
            </p>
            <BulletList items={normalized.suggestions} />
          </div>
        </div>
      ) : (
        <p className="text-sm leading-6 text-slate-500">
          Run a draft check before exporting to see how your builder resume scores
          against the target role.
        </p>
      )}
    </div>
  );
};

const Builder = () => {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const toast = useToast();
  const routeOptimizationContext = location.state?.optimizationContext || null;
  const [optimizationContext, setOptimizationContext] = useState(
    () => routeOptimizationContext || readStoredOptimizationContext()
  );
  const [draftAnalysis, setDraftAnalysis] = useState(null);
  const [checkingDraft, setCheckingDraft] = useState(false);

  const [resumeData, setResumeData] = useState(() => createDefaultResumeData());

  useEffect(() => {
    if (!routeOptimizationContext) return;

    setOptimizationContext(routeOptimizationContext);
    storeOptimizationContext(routeOptimizationContext);
    setDraftAnalysis(null);
  }, [routeOptimizationContext]);

  useEffect(() => {
    if (optimizationContext) {
      storeOptimizationContext(optimizationContext);
    }
  }, [optimizationContext]);

  const draftResumeText = useMemo(
    () => builderDataToResumeText(resumeData),
    [resumeData]
  );

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await pdf(<ResumePDF data={resumeData} />).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "resume.pdf";
      link.click();

      URL.revokeObjectURL(url);
      toast.success("Your resume PDF has been generated.");
    } catch (err) {
      console.error("PDF Error:", err);
      toast.error("Failed to generate PDF");
    }
  };

  const handleClearOptimizationContext = () => {
    clearStoredOptimizationContext();
    setOptimizationContext(null);
    setDraftAnalysis(null);
    toast.info("The builder is back to a general resume draft.");
  };

  const handleAddMissingSkill = (skill) => {
    const currentSkills = resumeData.skills?.technical || [];
    const nextSkills = mergeUniqueStrings(currentSkills, skill);
    const wasAdded = nextSkills.length > currentSkills.length;

    setResumeData((prev) => {
      return {
        ...prev,
        skills: {
          ...prev.skills,
          technical: mergeUniqueStrings(prev.skills?.technical || [], skill),
        },
      };
    });

    if (wasAdded) {
      toast.success(`${skill} was added to technical skills.`);
    } else {
      toast.info(`${skill} is already in technical skills.`);
    }
  };

  const handleCheckDraftFit = async () => {
    if (draftResumeText.replace(/\s/g, "").length < 80) {
      toast.warning("Add more resume content before running an ATS check.");
      return;
    }

    setCheckingDraft(true);

    try {
      const res = await api.post("/api/resume/analyze-text", {
        resumeText: draftResumeText,
        jobDescription: optimizationContext?.jobDescription || "",
        jobTitle: optimizationContext?.jobTitle || "",
      });

      setDraftAnalysis(res.data.analysis);
      toast.success("Draft ATS check is ready.");
    } catch (err) {
      console.error("Draft analysis error:", err);
      toast.error(err.response?.data?.message || "Could not check this draft.");
    } finally {
      setCheckingDraft(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoForm data={resumeData} setData={setResumeData} />;
      case 2:
        return <EducationForm data={resumeData} setData={setResumeData} />;
      case 3:
        return <ExperienceForm data={resumeData} setData={setResumeData} />;
      case 4:
        return <ProjectsForm data={resumeData} setData={setResumeData} />;
      case 5:
        return <SkillsForm data={resumeData} setData={setResumeData} />;
      default:
        return null;
    }
  };

  return (
    <AppShell
      title="Resume builder"
      description={
        optimizationContext
          ? "Improve a resume against the selected analysis brief."
          : "Build a clean PDF resume from guided sections."
      }
      actions={
        <>
          <SecondaryButton
            onClick={handleCheckDraftFit}
            disabled={checkingDraft}
            className="hidden sm:inline-flex"
          >
            {checkingDraft ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            Check Fit
          </SecondaryButton>
          <PrimaryButton onClick={handleDownloadPDF} className="hidden sm:inline-flex">
            <Download size={16} />
            Export PDF
          </PrimaryButton>
        </>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <OptimizationBrief
          context={optimizationContext}
          onAddSkill={handleAddMissingSkill}
          onClear={handleClearOptimizationContext}
        />

        <Stepper currentStep={currentStep} setCurrentStep={setCurrentStep} />

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(28rem,1.08fr)]">
          <GlassCard className="p-5 sm:p-6">
            {renderStep()}

            <div className="mt-6 flex justify-between gap-3 border-t border-slate-200 pt-5">
              <SecondaryButton
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Back
              </SecondaryButton>

              {currentStep === 5 ? (
                <div className="flex flex-wrap justify-end gap-3">
                  <SecondaryButton
                    type="button"
                    onClick={handleCheckDraftFit}
                    disabled={checkingDraft}
                  >
                    {checkingDraft ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <FileText size={16} />
                    )}
                    Check Fit
                  </SecondaryButton>
                  <PrimaryButton type="button" onClick={handleDownloadPDF}>
                    <Download size={16} />
                    Download PDF
                  </PrimaryButton>
                </div>
              ) : (
                <PrimaryButton type="button" onClick={nextStep}>
                  Next Step
                </PrimaryButton>
              )}
            </div>
          </GlassCard>

          <aside className="sticky top-24 h-fit space-y-4">
            <DraftFitPanel
              analysis={draftAnalysis}
              loading={checkingDraft}
              onCheck={handleCheckDraftFit}
            />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Live preview
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                    Resume document
                  </h2>
                </div>
                <span className="liquid-pill rounded-lg px-2 py-1 text-xs font-semibold text-slate-500">
                  PDF
                </span>
              </div>
              <div id="resume-preview">
                <ResumePreview data={resumeData} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
};

export default Builder;
