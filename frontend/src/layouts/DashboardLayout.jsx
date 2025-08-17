// src/layouts/DashboardLayout.jsx
import { useNavigate } from "react-router-dom";
import { logout, getRole, getName } from "../utils/auth";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const role = getRole();
  const username = getName();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHome = () => {
    navigate("/");
  };

  // Role-based sidebar links
  const sidebarLinks = {
    student: [
      { name: "Dashboard", path: "/student/dashboard" },
      { name: "Search Jobs", path: "/student/jobs" },
      { name: "My Applications", path: "/student/applications" },
      { name: "Profile", path: "/student/profile" },
      { name: "Settings", path: "/student/settings" }, // Added Settings
    ],
    recruiter: [
      { name: "Dashboard", path: "/recruiter/dashboard" },
      { name: "Company Profile", path: "/recruiter/company" },
      { name: "Manage Jobs", path: "/recruiter/jobs" },
      { name: "Applicants", path: "/recruiter/applicants" },
      { name: "Settings", path: "/recruiter/settings" },
    ],
    admin: [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "Users", path: "/admin/users" },
      { name: "Jobs", path: "/admin/jobs" },
      { name: "Companies", path: "/admin/companies" },
      { name: "Settings", path: "/admin/settings" },
    ],
  };

  return (
    <div className="flex text-white min-h-screen"
    style={{
          background:
            "linear-gradient(135deg, #ffffff14 0%, rgba(255, 255, 255, 0.12) 19%, rgba(255, 255, 255, 0.05) 28%, transparent 35%, transparent 100%), linear-gradient(to bottom, #18181b, #000000)",
        }}>
      {/* Sidebar */}
      <div className="w-64 relative">
        <div className="absolute inset-0"></div>
        <div className="relative h-full">
          <Sidebar links={sidebarLinks[role] || []} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent backdrop-blur-md border-b  border-dashed border-white/20 px-6 py-4">
          <h1 className="text-3xl">
            {username ? `Welcome back, ${username}.` : "Welcome to Dashboard"}
          </h1>
          <div className="flex gap-4 md:gap-7 items-center">
            <button onClick={handleHome}>Home</button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full border border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition duration-300"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-transparent to-black/30">{children}</main>
      </div>
    </div>
  );
}
