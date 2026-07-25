const GlassCard = ({ children, className = "" }) => {
  return (
    <div
      className={`liquid-glass rounded-2xl p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
