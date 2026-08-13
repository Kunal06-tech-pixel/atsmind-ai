const baseButtonClass =
  "ats-control-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export const PrimaryButton = ({
  children,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`${baseButtonClass} ats-control-button-primary ${className}`}
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
      className={`${baseButtonClass} ats-control-button-secondary ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
