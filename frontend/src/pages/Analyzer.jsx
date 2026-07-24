import { useLocation } from "react-router-dom";
import DashboardResumeAnalyzer from "../components/DashboardResumeAnalyzer";
import AppShell from "../components/ui/AppShell";

const Analyzer = () => {
  const location = useLocation();
  const preloadedResult = location.state?.analysisResult || null;

  return (
    <AppShell
      title="Resume analyzer"
      description="Upload a PDF and compare it against a target role."
    >
      <DashboardResumeAnalyzer preloadedResult={preloadedResult} />
    </AppShell>
  );
};

export default Analyzer;
