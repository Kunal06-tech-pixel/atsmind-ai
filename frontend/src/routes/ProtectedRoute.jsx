import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="glass-theme theme-bg flex min-h-screen items-center justify-center px-4">
        <div className="liquid-glass rounded-2xl px-5 py-4 text-sm font-medium text-slate-600">
          Checking session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
