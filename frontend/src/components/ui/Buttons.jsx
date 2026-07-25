const baseButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const PrimaryButton = ({
  children,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`${baseButtonClass} liquid-button-primary liquid-shine text-white hover:-translate-y-0.5 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const SecondaryButton = ({
  children,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`${baseButtonClass} liquid-pill text-slate-700 hover:-translate-y-0.5 hover:border-teal-200/70 hover:bg-white/75 hover:text-slate-950 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
