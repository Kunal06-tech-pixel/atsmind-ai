import {
  aiTipClass,
  inputClass,
  labelClass,
  sectionDescriptionClass,
  sectionTitleClass,
} from "../../../utils/uiClasses";

const PersonalInfoForm = ({ data, setData }) => {
  const personal = data.personal;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [name]: value,
      },
    }));
  };

  const fields = [
    { label: "Full Name *", name: "name", type: "text", placeholder: "John Doe" },
    { label: "Email *", name: "email", type: "email", placeholder: "john@example.com" },
    { label: "Phone", name: "phone", type: "text", placeholder: "+91 9876543210" },
    { label: "Location", name: "location", type: "text", placeholder: "Guwahati, Assam" },
    { label: "LinkedIn", name: "linkedin", type: "text", placeholder: "linkedin.com/in/johndoe" },
    { label: "Portfolio / Website", name: "portfolio", type: "text", placeholder: "johndoe.dev" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className={sectionTitleClass}>Let's start with your identity</h2>
        <p className={sectionDescriptionClass}>
          Your professional brand begins with who you are.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name}>
            <label className={labelClass}>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={personal[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div className={aiTipClass}>
        <span className="font-medium">AI Insight:</span> Keep LinkedIn and
        portfolio links updated so recruiters can quickly verify your work.
      </div>
    </div>
  );
};

export default PersonalInfoForm;
