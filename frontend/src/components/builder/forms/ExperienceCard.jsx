import api from "../../../services/axios";
import { Sparkles } from "lucide-react";
import { useToast } from "../../ui/useToast";
import {
  aiButtonClass,
  aiTipClass,
  inputClass,
  labelClass,
  nestedCardClass,
} from "../../../utils/uiClasses";

const ExperienceCard = ({ exp, index, setData }) => {
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [name]: value,
      };

      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const handleAISuggestions = async () => {
    try {
      if (!exp.responsibilities || !exp.responsibilities.trim()) {
        toast.error("Please enter some responsibilities first");
        return;
      }

      const res = await api.post("/api/ai/improve", {
        section: "experience",
        text: exp.responsibilities,
      });

      let output = res?.data?.improved;

      if (!output) {
        toast.error("AI returned empty response");
        return;
      }

      if (Array.isArray(output)) {
        output = output.join("\n");
      } else if (typeof output === "string") {
        output = output
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .join("\n");
      } else {
        toast.error("Unexpected AI response format");
        return;
      }

      setData((prev) => {
        const updated = [...prev.experience];
        updated[index].responsibilities = output;

        return {
          ...prev,
          experience: updated,
        };
      });
    } catch (err) {
      console.error("AI ERROR FULL:", err);
      toast.error("AI suggestion failed");
    }
  };

  return (
    <div className={`${nestedCardClass} space-y-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Experience {index + 1}</h3>
        <span className="text-xs text-slate-400">Role #{index + 1}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          type="text"
          name="jobTitle"
          value={exp.jobTitle}
          onChange={handleChange}
          placeholder="Job Title"
          className={inputClass}
        />

        <input
          type="text"
          name="company"
          value={exp.company}
          onChange={handleChange}
          placeholder="Company"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          type="date"
          name="start"
          value={exp.start}
          onChange={handleChange}
          className={inputClass}
        />

        <input
          type="date"
          name="end"
          value={exp.end}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className={labelClass}>Responsibilities</label>

          <button
            type="button"
          onClick={handleAISuggestions}
          className={aiButtonClass}
        >
          <Sparkles size={13} />
          AI Suggestions
        </button>
        </div>

        <textarea
          name="responsibilities"
          value={exp.responsibilities}
          onChange={handleChange}
          rows="5"
          placeholder="Describe your key achievements, impact, and technologies used..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className={aiTipClass}>
        <span className="font-medium">AI Insight:</span> Start bullet points
        with action verbs like <span className="font-semibold">Built</span>,{" "}
        <span className="font-semibold">Optimized</span>, or{" "}
        <span className="font-semibold">Developed</span>.
      </div>
    </div>
  );
};

export default ExperienceCard;
