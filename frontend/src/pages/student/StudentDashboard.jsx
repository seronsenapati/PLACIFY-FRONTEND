import { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import { 
  Briefcase as BriefcaseIcon,
  Calendar as CalendarIcon,
  Bookmark as BookmarkIcon,
  UserCheck as UserCheckIcon,
  Eye as EyeIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  TrendingUp as TrendingUpIcon,
  AlertCircle as AlertCircleIcon
} from "../../components/CustomIcons";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      // Load applications data
      const applicationsRes = await api.get("/applications/student");
      setApplications(applicationsRes.data.data?.applications || []);
      
      // Load application statistics
      const statsRes = await api.get("/applications/student/stats");
      setStats(statsRes.data.data || {});
      
      // Load bookmarked jobs
      const bookmarksRes = await api.get("/jobs/student/bookmarks");
      setBookmarkedJobs(bookmarksRes.data.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setErrorMsg('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-hide error messages after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const getStatusStyles = (status) => {
    const baseStyles = "px-3 py-1.5 rounded-full text-xs font-medium flex items-center";
    
    switch(status) {
      case "reviewed":
        return `${baseStyles} bg-blue-500/20 text-blue-300 border border-blue-500/30`;
      case "rejected":
        return `${baseStyles} bg-red-500/20 text-red-300 border border-red-500/30`;
      case "pending":
        return `${baseStyles} bg-yellow-500/20 text-yellow-300 border border-yellow-500/30`;
      case "withdrawn":
        return `${baseStyles} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
      default:
        return `${baseStyles} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "reviewed":
        return <EyeIcon className="w-4 h-4 mr-1.5" />;
      case "rejected":
        return <XCircleIcon className="w-4 h-4 mr-1.5" />;
      case "pending":
        return <ClockIcon className="w-4 h-4 mr-1.5" />;
      default:
        return null;
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <LoadingScreen 
        title="Loading Dashboard"
        subtitle="Preparing your personalized dashboard..."
        steps={[
          { text: "Fetching application data", color: "blue" },
          { text: "Loading statistics", color: "purple" },
          { text: "Preparing interface", color: "green" }
        ]}
      />
    );
  }

  // Calculate stats from available data
  const totalApplications = applications.length;
  const activeApplications = applications.filter(app => app.status === 'pending').length;
  const savedJobs = bookmarkedJobs.length;
  
  // Calculate success rate
  const reviewedApps = applications.filter(app => app.status === 'reviewed').length;
  const rejectedApps = applications.filter(app => app.status === 'rejected').length;
  const successRate = (reviewedApps + rejectedApps) > 0 
    ? Math.round((reviewedApps / (reviewedApps + rejectedApps)) * 100) 
    : 0;

  const dashboardStats = [
    { 
      label: "Total Applications", 
      value: totalApplications, 
      icon: <BriefcaseIcon className="w-5 h-5 text-blue-300" />,
    },
    { 
      label: "Active Applications", 
      value: activeApplications, 
      icon: <ClockIcon className="w-5 h-5 text-amber-300" />,
    },
    { 
      label: "Saved Jobs", 
      value: savedJobs, 
      icon: <BookmarkIcon className="w-5 h-5 text-purple-300" />,
    },
    { 
      label: "Success Rate", 
      value: `${successRate}%`, 
      icon: <TrendingUpIcon className="w-5 h-5 text-green-300" />,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start w-full">
      <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Your personalized career dashboard</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/20 text-red-300 text-sm rounded-lg border border-red-500/30 flex items-center gap-3">
            <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="flex-shrink-0 hover:opacity-70 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {dashboardStats.map((stat, index) => (
            <div
              key={stat.label}
              className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10 hover:border-white/20 h-full flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-400 truncate">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums">{stat.value}</p>
                </div>
                <div className="flex-shrink-0 ml-4 p-2.5 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center h-10 w-10">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Recent Applications */}
        <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 mt-6">
          <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <p className="text-sm text-gray-400 mt-1">Your recent job applications</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.slice(0, 5).map((app, index) => (
                  <tr 
                    key={app._id || app.id || index}
                    className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/2.5' : 'bg-white/5'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {app.job?.title || app.jobDetails?.title || 'Unknown Position'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {app.job?.role || app.jobDetails?.role || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {app.job?.company?.name || app.jobDetails?.company?.name || 'Unknown Company'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1.5 text-gray-500" />
                        {formatDate(app.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={getStatusStyles(app.status)}>
                        {getStatusIcon(app.status)}
                        {formatStatus(app.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {!applications.length && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="text-gray-400">No applications found</div>
                      <p className="mt-1 text-sm text-gray-500">Your job applications will appear here</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing <span className="font-medium">1-{Math.min(5, applications.length)}</span> of <span className="font-medium">{applications.length}</span> applications
            </p>
            <button className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition">
              View all applications →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}