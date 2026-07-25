import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Analyzer from "./pages/Analyzer";
import Builder from "./pages/Builder";
import Dashboard from "./pages/Dashboard";
import ResumeDetail from "./pages/ResumeDetail";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateJob from "./pages/recruiter/CreateJob";
import CandidateComparison from "./pages/recruiter/CandidateComparison";
import CandidateDetails from "./pages/recruiter/CandidateDetails";
import CandidateRankings from "./pages/recruiter/CandidateRankings";
import CandidateUpload from "./pages/recruiter/CandidateUpload";
import JobDetails from "./pages/recruiter/JobDetails";
import JobOpenings from "./pages/recruiter/JobOpenings";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterPlaceholder from "./pages/recruiter/RecruiterPlaceholder";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/useAuth";
import { getDashboardPathByRole, USER_ROLES } from "./utils/roles";

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/login"
          element={
            user ? <Navigate to={getDashboardPathByRole(user)} replace /> : <Login />
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.jobSeeker, USER_ROLES.admin]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume/:id"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.jobSeeker, USER_ROLES.admin]}>
              <ResumeDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analyzer"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.jobSeeker, USER_ROLES.admin]}>
              <Analyzer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/builder"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.jobSeeker, USER_ROLES.admin]}>
              <Builder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.jobSeeker, USER_ROLES.admin]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.recruiter]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.recruiter]}>
              <JobOpenings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs/new"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.recruiter]}>
              <CreateJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs/:jobId"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.recruiter]}>
              <JobDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/candidates"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.recruiter]}>
              <CandidateUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/rankings"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.recruiter]}>
              <CandidateRankings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/evaluations/:evaluationId"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.recruiter]}>
              <CandidateDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/comparison"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.recruiter]}>
              <CandidateComparison />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/shortlists"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.recruiter]}>
              <CandidateRankings statusFilter="shortlisted" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/reports"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.recruiter]}>
              <RecruiterPlaceholder
                title="Reports"
                description="Generate recruiter evaluation reports."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/profile"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.recruiter]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.admin]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
