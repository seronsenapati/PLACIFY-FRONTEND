// src/layouts/DashboardLayout.jsx
import { useNavigate } from "react-router-dom";
import { logout, getRole, getName } from "../utils/auth";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const role = getRole();
  const username = getName();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // State for mobile sidebar visibility
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (role !== 'student' && role !== 'recruiter') return;
      
      try {
        const response = await api.get("/notifications/stats");
        const unread = response.data.data?.unread || 0;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to fetch notification stats:", error);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();

    // Set up polling to refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [role]);

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952  0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
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
      { 
        name: "Notifications", 
        path: "/student/notifications", 
        badge: unreadCount > 0 ? unreadCount.toString() : null
      },
      { name: "Profile", path: "/student/profile", badge: null },
      { name: "Settings", path: "/student/settings", badge: null },
    ],
    recruiter: [
      { name: "Dashboard", path: "/recruiter/dashboard", badge: null },
      { name: "Company Profile", path: "/recruiter/company", badge: null },
      { name: "Manage Jobs", path: "/recruiter/jobs", badge: null },
      { name: "Applications", path: "/recruiter/applications", badge: null },
      { 
        name: "Notifications", 
        path: "/recruiter/notifications", 
        badge: unreadCount > 0 ? unreadCount.toString() : null
      },
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

      {/* Mobile sidebar overlay - only visible on small screens when open */}
      <div 
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden ${
          mobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      ></div>

      {/* Enhanced Sidebar - responsive for mobile and desktop */}
      <div className={`hidden lg:block ${sidebarCollapsed ? 'w-20' : 'w-64'} relative transition-all duration-300 ease-in-out`}>
        <div className="absolute inset-0 border-r border-dashed border-white/20"></div>
        <div className="relative h-full">
          <Sidebar 
            links={sidebarLinks[role] || []} 
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onHome={handleHome}
            onLogout={handleLogout}
            isMobile={false}
          />
        </div>
      </div>

      {/* Mobile sidebar - only visible on small screens when open */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute inset-0 border-r border-dashed border-white/20"></div>
        <div className="relative h-full">
          <Sidebar 
            links={sidebarLinks[role] || []} 
            collapsed={false}
            onToggle={() => setMobileSidebarOpen(false)}
            onHome={handleHome}
            onLogout={handleLogout}
            isMobile={true}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        {/* Enhanced Top Navbar - responsive for mobile and desktop */}
        <header className="relative backdrop-blur-md bg-white/5 border-b border-dashed border-white/20 shadow-lg">
          <div className="flex justify-between items-center px-6 py-4">
            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 active:scale-95 transition-all duration-200 ease-in-out -ml-3"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h12M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center gap-4 -ml-17 sm:-ml-0 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                {username ? `Welcome back, ${username}.` : "Welcome to Dashboard"}
              </h1>
              <div className={`hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRoleColor(role)} shadow-lg flex-shrink-0`}>
                {getRoleIcon(role)}
                <span className="capitalize">{role}</span>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-4 md:gap-7 items-center">
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
              
              {/* Navigation Buttons -- Visible on all views */}
              <button onClick={handleHome} className="hidden lg:block">Home</button>
              <button
                onClick={handleLogout}
                className="hidden lg:block py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-red-500/20 hover:border-red-500/50 transition"
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