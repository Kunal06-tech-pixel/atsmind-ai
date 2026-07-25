import ExperienceCard from "./ExperienceCard";
import { PrimaryButton } from "../../ui/Buttons";
import { Plus } from "lucide-react";
import {
  sectionDescriptionClass,
  sectionTitleClass,
} from "../../../utils/uiClasses";

const ExperienceForm = ({ data, setData }) => {
  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          jobTitle: "",
          company: "",
          start: "",
          end: "",
          responsibilities: "",
        },
      ],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className={sectionTitleClass}>Tell us about your experience</h2>
          <p className={sectionDescriptionClass}>
            Add all your relevant roles. Multiple experiences supported.
          </p>
        </div>

        <PrimaryButton onClick={addExperience} className="px-3 py-2">
          <Plus size={15} />
          Add
        </PrimaryButton>
      </div>

      <div className="space-y-5">
        {data.experience.map((exp, index) => (
          <ExperienceCard
            key={index}
            exp={exp}
            index={index}
            setData={setData}
          />
        ))}
      </div>
    </div>
  );
};

export default ExperienceForm;
