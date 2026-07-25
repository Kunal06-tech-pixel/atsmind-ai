import { PrimaryButton } from "../../ui/Buttons";
import { Plus } from "lucide-react";
import {
  inputClass,
  nestedCardClass,
  sectionDescriptionClass,
  sectionTitleClass,
} from "../../../utils/uiClasses";

const emptyEducation = {
  school: "",
  degree: "",
  field: "",
  start: "",
  end: "",
  gpa: "",
};

const EducationForm = ({ data, setData }) => {
  const educationList = data.education || [emptyEducation];

  const handleChange = (index, e) => {
    const { name, value } = e.target;

    setData((prev) => {
      const updated = [...prev.education];
      updated[index] = {
        ...updated[index],
        [name]: value,
      };

      return {
        ...prev,
        education: updated,
      };
    });
  };

  const addEducation = () => {
    setData((prev) => ({
      ...prev,
      education: [...prev.education, { ...emptyEducation }],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={sectionTitleClass}>Tell us about your education</h2>
          <p className={sectionDescriptionClass}>
            Add all your academic qualifications.
          </p>
        </div>

        <PrimaryButton onClick={addEducation} className="px-3 py-2">
          <Plus size={15} />
          Add
        </PrimaryButton>
      </div>

      {educationList.map((education, index) => (
        <div key={index} className={`${nestedCardClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-800">Education {index + 1}</h3>
            <span className="text-xs text-slate-400">Degree #{index + 1}</span>
          </div>

          <input
            type="text"
            name="school"
            value={education.school}
            onChange={(e) => handleChange(index, e)}
            placeholder="School / University"
            className={inputClass}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <select
              name="degree"
              value={education.degree}
              onChange={(e) => handleChange(index, e)}
              className={inputClass}
            >
              <option value="">Select Degree</option>
              <option value="Bachelor's">Bachelor's</option>
              <option value="Master's">Master's</option>
              <option value="Diploma">Diploma</option>
              <option value="PhD">PhD</option>
            </select>

            <input
              type="text"
              name="field"
              value={education.field}
              onChange={(e) => handleChange(index, e)}
              placeholder="Field of Study"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="date"
              name="start"
              value={education.start}
              onChange={(e) => handleChange(index, e)}
              className={inputClass}
            />

            <input
              type="date"
              name="end"
              value={education.end}
              onChange={(e) => handleChange(index, e)}
              className={inputClass}
            />
          </div>

          <input
            type="text"
            name="gpa"
            value={education.gpa}
            onChange={(e) => handleChange(index, e)}
            placeholder="GPA / CGPA (Optional)"
            className={inputClass}
          />
        </div>
      ))}
    </div>
  );
};

export default EducationForm;
