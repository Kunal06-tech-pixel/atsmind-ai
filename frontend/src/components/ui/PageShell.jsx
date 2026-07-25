import AppNav from "../AppNav";

const PageShell = ({ children, showNav = true, className = "" }) => {
  return (
    <div className="glass-theme theme-bg relative min-h-screen overflow-hidden text-slate-950">
      <div className="relative z-10">
        {showNav && <AppNav />}
        <main className={className}>{children}</main>
      </div>
    </div>
  );
};

export default PageShell;
