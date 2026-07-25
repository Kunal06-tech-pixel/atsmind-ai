import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  aiTipClass,
  inputClass,
  nestedCardClass,
  pillClass,
  sectionDescriptionClass,
  sectionTitleClass,
} from "../../../utils/uiClasses";

const SkillsForm = ({ data, setData }) => {
  const skills = data.skills;

  const [techInput, setTechInput] = useState("");
  const [softInput, setSoftInput] = useState("");
  const [certName, setCertName] = useState("");
  const [certLink, setCertLink] = useState("");

  const addSkill = (type, value) => {
    if (!value.trim()) return;

    setData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: [...prev.skills[type], value.trim()],
      },
    }));
  };

  const removeSkill = (type, index) => {
    setData((prev) => {
      const updated = [...prev.skills[type]];
      updated.splice(index, 1);

      return {
        ...prev,
        skills: {
          ...prev.skills,
          [type]: updated,
        },
      };
    });
  };

  const addCertification = () => {
    if (!certName.trim()) return;

    setData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        certifications: [
          ...prev.skills.certifications,
          { name: certName.trim(), link: certLink.trim() },
        ],
      },
    }));

    setCertName("");
    setCertLink("");
  };

  const renderSkillPill = (skill, index, type) => (
    <span key={`${skill}-${index}`} className={`${pillClass} flex items-center gap-1`}>
      {skill}
      <button
        type="button"
        onClick={() => removeSkill(type, index)}
        className="rounded-sm text-slate-400 transition hover:text-red-600"
        aria-label={`Remove ${skill}`}
      >
        <X size={12} />
      </button>
    </span>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className={sectionTitleClass}>What are your superpowers?</h2>
        <p className={sectionDescriptionClass}>
          Add skills & certifications to boost ATS compatibility.
        </p>
      </div>

      <div className={`${nestedCardClass} space-y-6`}>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Technical Skills
          </p>

          <input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill("technical", techInput);
                setTechInput("");
              }
            }}
            placeholder="Add technical skill and press Enter"
            className={inputClass}
          />

          <div className="mt-2 flex flex-wrap gap-2">
            {skills.technical.map((skill, index) =>
              renderSkillPill(skill, index, "technical")
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Soft Skills</p>

          <input
            value={softInput}
            onChange={(e) => setSoftInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill("soft", softInput);
                setSoftInput("");
              }
            }}
            placeholder="Add soft skill and press Enter"
            className={inputClass}
          />

          <div className="mt-2 flex flex-wrap gap-2">
            {skills.soft.map((skill, index) =>
              renderSkillPill(skill, index, "soft")
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Certifications
          </p>

          <input
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            placeholder="Certification name"
            className={`${inputClass} mb-2`}
          />

          <input
            value={certLink}
            onChange={(e) => setCertLink(e.target.value)}
            placeholder="Certification link (optional)"
            className={inputClass}
          />

          <button
            type="button"
            onClick={addCertification}
            className="liquid-pill mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Plus size={13} />
            Add Certification
          </button>

          <div className="mt-3 flex flex-col gap-2">
            {skills.certifications.map((cert, index) => (
              <div
                key={`${typeof cert === "string" ? cert : cert.name}-${index}`}
                className="liquid-pill flex items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-700"
              >
                <span className="truncate">
                  {typeof cert === "string" ? cert : cert.name}
                </span>

                <button
                  type="button"
                  onClick={() => removeSkill("certifications", index)}
                  className="ml-2 rounded-sm text-slate-400 transition hover:text-red-600"
                  aria-label="Remove certification"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={aiTipClass}>
          <span className="font-medium">AI Insight:</span> Include
          certifications like AWS, Google Cloud, or Coursera to boost ATS
          ranking.
        </div>
      </div>
    </div>
  );
};

export default SkillsForm;
