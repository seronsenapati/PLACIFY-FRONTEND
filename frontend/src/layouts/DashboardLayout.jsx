// src/layouts/DashboardLayout.jsx
import { useNavigate } from "react-router-dom";
import { logout, getRole, getName } from "../utils/auth";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const role = getRole();
  const username = getName();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHome = () => {
    navigate("/");
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "student":
        return "from-blue-500 to-blue-600";
      case "recruiter":
        return "from-green-500 to-green-600";
      case "admin":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "student":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case "recruiter":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        );
      case "admin":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Role-based sidebar links with enhanced metadata
  const sidebarLinks = {
    student: [
      { name: "Dashboard", path: "/student/dashboard", badge: null },
      { name: "Jobs", path: "/student/jobs", badge: "New" },
      { name: "Saved Jobs", path: "/student/saved-jobs", badge: null },
      { name: "My Applications", path: "/student/applications", badge: null },
      { name: "Notifications", path: "/student/notifications", badge: "3" },
      { name: "Profile", path: "/student/profile", badge: null },
      { name: "Settings", path: "/student/settings", badge: null },
    ],
    recruiter: [
      { name: "Dashboard", path: "/recruiter/dashboard", badge: null },
      { name: "Company Profile", path: "/recruiter/company", badge: null },
      { name: "Manage Jobs", path: "/recruiter/jobs", badge: null },
      { name: "Applicants", path: "/recruiter/applicants", badge: "12" },
      { name: "Settings", path: "/recruiter/settings", badge: null },
    ],
    admin: [
      { name: "Dashboard", path: "/admin/dashboard", badge: null },
      { name: "Users", path: "/admin/users", badge: null },
      { name: "Jobs", path: "/admin/jobs", badge: null },
      { name: "Companies", path: "/admin/companies", badge: null },
      { name: "Settings", path: "/admin/settings", badge: null },
    ],
  };

  return (
    <div className="flex text-white min-h-screen relative overflow-hidden"
    style={{
          background:
            "linear-gradient(135deg, #ffffff14 0%, rgba(255, 255, 255, 0.12) 19%, rgba(255, 255, 255, 0.05) 28%, transparent 35%, transparent 100%), linear-gradient(to bottom, #18181b, #000000)",
        }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-green-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Enhanced Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} relative transition-all duration-300 ease-in-out`}>
        <div className="absolute inset-0 border-r border-dashed border-white/20"></div>
        <div className="relative h-full">
          <Sidebar 
            links={sidebarLinks[role] || []} 
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            role={role}
            username={username}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        {/* Enhanced Top Navbar */}
        <header className="relative backdrop-blur-md bg-white/5 border-b border-dashed border-white/20 shadow-lg">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">
                {username ? `Welcome back, ${username}.` : "Welcome to Dashboard"}
              </h1>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRoleColor(role)} shadow-lg`}>
                {getRoleIcon(role)}
                <span className="capitalize">{role}</span>
              </div>
            </div>
            
            <div className="flex gap-4 md:gap-7 items-center">
              {/* Time Display */}
              <div className="hidden md:flex flex-col items-end text-xs text-gray-300">
                <div className="font-medium">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-gray-400">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              
              {/* Navigation Buttons -- Previous Style */}
              <button onClick={handleHome}>Home</button>
              <button
                onClick={handleLogout}
                className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-red-500/20 hover:border-red-500/50 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Enhanced Page content */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="p-2 min-h-full bg-gradient-to-br from-transparent via-white/[0.02] to-black/20">
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
