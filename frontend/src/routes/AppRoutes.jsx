// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "../utils/auth";

// Pages
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import JobListing from "../pages/JobListing";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import NotFound from "../pages/NotFound";
import StudentDashboard from "../pages/student/StudentDashboard";
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

// Route guard
function ProtectedRoute({ children, allowedRoles }) {
  const ok = isLoggedIn() && allowedRoles.includes(getRole());
  return ok ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/jobs" element={<JobListing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />

      {/* Student */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Recruiter */}
      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
