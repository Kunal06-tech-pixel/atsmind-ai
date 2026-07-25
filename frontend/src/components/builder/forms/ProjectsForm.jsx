import api from "../../../services/axios";
import { PrimaryButton } from "../../ui/Buttons";
import { Plus, Sparkles } from "lucide-react";
import { useToast } from "../../ui/useToast";
import {
  aiButtonClass,
  inputClass,
  labelClass,
  nestedCardClass,
  sectionDescriptionClass,
  sectionTitleClass,
} from "../../../utils/uiClasses";

const emptyProject = {
  title: "",
  techStack: "",
  description: "",
  github: "",
  live: "",
};

const ProjectsForm = ({ data, setData }) => {
  const projects = data.projects || [emptyProject];
  const toast = useToast();

  const handleChange = (index, e) => {
    const { name, value } = e.target;

    setData((prev) => {
      const updatedProjects = [...prev.projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        [name]: value,
      };

      return {
        ...prev,
        projects: updatedProjects,
      };
    });
  };

  const addProject = () => {
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, { ...emptyProject }],
    }));
  };

  const handleAISuggestions = async (index) => {
    try {
      const project = data.projects[index];

      if (!project.description) {
        toast.error("Please write some description first");
        return;
      }

      const res = await api.post("/api/ai/improve", {
        section: "project",
        text: project.description,
      });

      const improved = res.data.improved;
      const improvedText = Array.isArray(improved)
        ? improved.join("\n")
        : String(improved || "");

      setData((prev) => {
        const updated = [...prev.projects];
        updated[index].description = improvedText;

        return {
          ...prev,
          projects: updated,
        };
      });
    } catch (err) {
      console.error("AI error:", err);
      toast.error("AI suggestions failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={sectionTitleClass}>Showcase your projects</h2>
          <p className={sectionDescriptionClass}>
            Add portfolio, internship, or academic projects.
          </p>
        </div>

        <PrimaryButton onClick={addProject} className="px-3 py-2">
          <Plus size={15} />
          Add
        </PrimaryButton>
      </div>

      {projects.map((project, index) => (
        <div key={index} className={`${nestedCardClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-800">Project {index + 1}</h3>
            <span className="text-xs text-slate-400">Work #{index + 1}</span>
          </div>

          <input
            type="text"
            name="title"
            value={project.title}
            onChange={(e) => handleChange(index, e)}
            placeholder="Project Title"
            className={inputClass}
          />

          <input
            type="text"
            name="techStack"
            value={project.techStack}
            onChange={(e) => handleChange(index, e)}
            placeholder="Tech Stack (React, Node.js, MongoDB...)"
            className={inputClass}
          />

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className={labelClass}>Description</label>

              <button
                type="button"
                onClick={() => handleAISuggestions(index)}
                className={aiButtonClass}
              >
                <Sparkles size={13} />
                AI Suggestions
              </button>
            </div>

            <textarea
              name="description"
              value={project.description}
              onChange={(e) => handleChange(index, e)}
              rows="4"
              placeholder="Describe what this project does, your contribution, and impact..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <input
            type="text"
            name="github"
            value={project.github}
            onChange={(e) => handleChange(index, e)}
            placeholder="GitHub Repository Link"
            className={inputClass}
          />

          <input
            type="text"
            name="live"
            value={project.live}
            onChange={(e) => handleChange(index, e)}
            placeholder="Live Project Link (optional)"
            className={inputClass}
          />
        </div>
      ))}
    </div>
  );
};

export default ProjectsForm;
