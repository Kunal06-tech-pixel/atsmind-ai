const steps = [
  "Personal",
  "Education",
  "Experience",
  "Projects",
  "Skills & Certs",
];

const Stepper = ({ currentStep, setCurrentStep }) => {
  return (
    <div className="ats-builder-stepper liquid-glass" aria-label="Resume builder steps">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <button
            key={step}
            type="button"
            aria-current={isActive ? "step" : undefined}
            onClick={() => setCurrentStep(stepNumber)}
            className={`ats-builder-step${isActive ? " is-active" : ""}${isCompleted ? " is-complete" : ""}`}
          >
            <span
              className="ats-builder-step-number"
            >
              {stepNumber}
            </span>
            <span className="whitespace-nowrap text-sm font-medium">{step}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Stepper;
