import { Routes, Route, Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "../utils/auth";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Public Pages
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import JobListing from "../pages/JobListing";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import NotFound from "../pages/NotFound";

// Dashboards
import StudentDashboard from "../pages/student/StudentDashboard";
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

// Student feature pages
import StudentJobs from "../pages/student/StudentJobs";
import StudentApplications from "../pages/student/StudentApplications";
import StudentProfile from "../pages/student/StudentProfile";
import StudentSettings from "../pages/student/StudentSettings";
import StudentNotifications from "../pages/student/StudentNotifications";
import StudentSavedJobs from "../pages/student/StudentSavedjobs";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = getRole();

  // 🔎 Debug log
  console.log("ProtectedRoute Debug", { token, role, allowedRoles });

  const ok = isLoggedIn() && allowedRoles.includes(role?.toLowerCase());
  return ok ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        }
      />
      <Route
        path="/jobs"
        element={
          <PublicLayout>
            <JobListing />
          </PublicLayout>
        }
      />
      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <Register />
          </PublicLayout>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <PublicLayout>
            <PrivacyPolicy />
          </PublicLayout>
        }
      />
      <Route
        path="/terms-of-service"
        element={
          <PublicLayout>
            <TermsOfService />
          </PublicLayout>
        }
      />

      {/* Student Dashboard + Features */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout>
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/jobs"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout>
              <StudentJobs />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/saved-jobs"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout>
              <StudentSavedJobs />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/applications"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout>
              <StudentApplications />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout>
              <StudentProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout>
              <StudentSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notifications"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout>
              <StudentNotifications />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Recruiter */}
      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <DashboardLayout>
              <RecruiterDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
