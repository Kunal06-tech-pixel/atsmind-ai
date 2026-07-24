const steps = [
  "Personal",
  "Education",
  "Experience",
  "Projects",
  "Skills & Certs",
];

const Stepper = ({ currentStep, setCurrentStep }) => {
  return (
    <div className="liquid-glass flex w-full items-center gap-2 overflow-x-auto rounded-2xl p-2">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <button
            key={step}
            type="button"
            onClick={() => setCurrentStep(stepNumber)}
            className={`flex min-w-fit flex-1 items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
              isActive
                ? "liquid-button-primary text-white"
                : isCompleted
                ? "bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/80"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                isActive
                  ? "bg-white/90 text-slate-950"
                  : isCompleted
                  ? "bg-emerald-100/80 text-emerald-700"
                  : "liquid-pill text-slate-500"
              }`}
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
