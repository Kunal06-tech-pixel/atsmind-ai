import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getUserRole } from "../utils/roles";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  if (allowedRoles?.length && !allowedRoles.includes(getUserRole(user))) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
