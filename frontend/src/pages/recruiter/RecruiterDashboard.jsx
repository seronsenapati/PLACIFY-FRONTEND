import { useEffect, useState } from "react";
import {
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  MessageSquare as MessageSquareIcon,
  FileText as FileTextIcon,
  Calendar as CalendarIcon,
  AlertTriangle as AlertTriangleIcon
} from "../../components/CustomIcons";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";
import { getUserId } from "../../utils/auth";

export default function RecruiterDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackStats, setFallbackStats] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [company, setCompany] = useState(null); // Simplified company state

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  // Fetch company data directly to ensure we have complete information for the current recruiter
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const res = await api.get("/companies");
        console.log("[Dashboard] Companies API response:", res);
        if (res?.data?.data?.companies && res.data.data.companies.length > 0) {
          // Get the current user ID
          const currentUserId = getUserId();
          console.log("[Dashboard] Current user ID:", currentUserId);
          
          // Find the company created by the current user
          const userCompany = res.data.data.companies.find(
            comp => comp.createdBy === currentUserId
          );
          
          if (userCompany) {
            console.log("[Dashboard] User company data:", userCompany);
            console.log("[Dashboard] Company logo URL:", userCompany?.logo);
            setCompany(userCompany);
          } else {
            console.log("[Dashboard] No company found for current user");
          }
        } else {
          console.log("[Dashboard] No companies found in response");
        }
      } catch (err) {
        console.error("Failed to fetch company data:", err);
        console.error("Error details:", err.response?.data || err.message);
      }
    };

    fetchCompanyData();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [retryCount]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load the main dashboard data first
      const res = await api.get("/dashboard/recruiter/overview");
      console.log("[Dashboard] Main dashboard API response:", res);
      
      // Validate response structure
      if (res && res.data && res.data.success) {
        const dashboardData = res.data.data;
        console.log("[Dashboard] Main dashboard data:", dashboardData);
        setDashboardData(dashboardData);
      } else {
        throw new Error("Invalid response structure from server");
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      console.error("Error details:", err.response?.data || err.message);

      // If main dashboard fails, try to load fallback data
      try {
        await loadFallbackDashboardData();
      } catch (fallbackErr) {
        console.error("Failed to load fallback data:", fallbackErr);

        // Set appropriate error message
        if (err.response) {
          // Server responded with error status
          switch (err.response.status) {
            case 500:
              setErrorMsg("Server error - the dashboard service is currently unavailable. Please try again later.");
              break;
            case 401:
              setErrorMsg("Authentication error - please log in again.");
              break;
            case 403:
              setErrorMsg("Access denied - you don't have permission to view this dashboard.");
              break;
            case 404:
              setErrorMsg("Dashboard service not found. Please contact support.");
              break;
            default:
              setErrorMsg(`Server error (${err.response.status}) - ${err.response.data?.message || "Unknown error"}`);
          }
        } else if (err.request) {
          // Request was made but no response received
          setErrorMsg("Network error - please check your connection and try again.");
        } else {
          // Something else happened
          setErrorMsg("An unexpected error occurred. Please try again later.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Update this useEffect to properly extract application counts from applications data
  useEffect(() => {
    if (dashboardData && dashboardData.recentActivity && dashboardData.recentActivity.length > 0) {
      // Create a copy of recentActivity
      let updatedRecentActivity = [...dashboardData.recentActivity];
      
      // Check if we have applications data with job-based statistics
      if (dashboardData.applications) {
        // Look for job-based application statistics
        let jobApplicationCounts = {};
        
        // Check different possible structures for job-based stats
        if (dashboardData.applications.byJob) {
          // Direct byJob mapping
          jobApplicationCounts = dashboardData.applications.byJob;
        } else if (dashboardData.applications.jobStats) {
          // Job stats in a separate property
          jobApplicationCounts = dashboardData.applications.jobStats;
        } else if (dashboardData.applications.stats && dashboardData.applications.stats.byJob) {
          // Nested stats structure
          jobApplicationCounts = dashboardData.applications.stats.byJob;
        }
        
        // If we found job-based application counts, map them to jobs
        if (Object.keys(jobApplicationCounts).length > 0) {
          updatedRecentActivity = updatedRecentActivity.map(job => {
            const jobId = job._id || job.id;
            const applicationCount = jobId ? (jobApplicationCounts[jobId] || 0) : 0;
            
            return {
              ...job,
              applicationCount
            };
          });
        } else if (dashboardData.applications.total > 0) {
          // If we have total applications but no job breakdown,
          // and we know there are applications, we might need to fetch them
          // But to avoid rate limiting, let's distribute them evenly as a fallback
          const totalJobs = updatedRecentActivity.length;
          const avgApplications = Math.floor(dashboardData.applications.total / totalJobs);
          const remainder = dashboardData.applications.total % totalJobs;
          
          updatedRecentActivity = updatedRecentActivity.map((job, index) => {
            // Distribute remainder among first few jobs
            const additional = index < remainder ? 1 : 0;
            return {
              ...job,
              applicationCount: avgApplications + additional
            };
          });
        } else {
          // No applications, set all to 0
          updatedRecentActivity = updatedRecentActivity.map(job => ({
            ...job,
            applicationCount: 0
          }));
        }
      } else {
        // If no applications data, check if jobs already have application data
        updatedRecentActivity = updatedRecentActivity.map(job => {
          // If job already has applicationCount, keep it
          if (job.applicationCount !== undefined) {
            return job;
          }
          
          // If job has applications array, use its length
          if (job.applications && Array.isArray(job.applications)) {
            return {
              ...job,
              applicationCount: job.applications.length
            };
          }
          
          // Default to 0
          return {
            ...job,
            applicationCount: 0
          };
        });
      }
      
      // Only update if there are changes
      if (JSON.stringify(dashboardData.recentActivity) !== JSON.stringify(updatedRecentActivity)) {
        setDashboardData(prev => ({
          ...prev,
          recentActivity: updatedRecentActivity
        }));
      }
    }
  }, [dashboardData]);

  // Also update the fallback data loading to better handle application counts
  const loadFallbackDashboardData = async () => {
    try {
      // Load jobs stats as fallback
      const [statsRes, jobsRes, profileRes, applicationsRes] = await Promise.all([
        api.get("/jobs/recruiter/stats").catch(err => {
          console.error("[Dashboard Fallback] Failed to fetch jobs stats:", err);
          return null;
        }),
        api.get("/jobs/recruiter/my-jobs?limit=5").catch(err => {
          console.error("[Dashboard Fallback] Failed to fetch jobs:", err);
          return null;
        }),
        api.get("/profile").catch(err => {
          console.error("[Dashboard Fallback] Failed to fetch profile:", err);
          return null;
        }),
        api.get("/applications/recruiter/stats").catch(err => {
          console.error("[Dashboard Fallback] Failed to fetch applications stats:", err);
          return null;
        })
      ]);

      // Get jobs data
      let recentJobs = jobsRes?.data?.data?.jobs || [];
      
      // Try to get application counts from the applications stats if available
      if (recentJobs.length > 0 && applicationsRes?.data?.data) {
        const applicationsStats = applicationsRes.data.data;
        
        // Look for job-based application statistics in different possible structures
        let jobApplicationCounts = {};
        
        if (applicationsStats.byJob) {
          // Direct byJob mapping
          jobApplicationCounts = applicationsStats.byJob;
        } else if (applicationsStats.jobStats) {
          // Job stats in a separate property
          jobApplicationCounts = applicationsStats.jobStats;
        } else if (applicationsStats.stats && applicationsStats.stats.byJob) {
          // Nested stats structure
          jobApplicationCounts = applicationsStats.stats.byJob;
        }
        
        // If we found job-based application counts, map them to jobs
        if (Object.keys(jobApplicationCounts).length > 0) {
          recentJobs = recentJobs.map(job => {
            const jobId = job._id || job.id;
            const applicationCount = jobId ? (jobApplicationCounts[jobId] || 0) : 0;
            
            return {
              ...job,
              applicationCount
            };
          });
        } else if (applicationsStats.total > 0) {
          // If we have total applications but no job breakdown,
          // and we know there are applications, distribute them evenly as a fallback
          const totalJobs = recentJobs.length;
          const avgApplications = Math.floor(applicationsStats.total / totalJobs);
          const remainder = applicationsStats.total % totalJobs;
          
          recentJobs = recentJobs.map((job, index) => {
            // Distribute remainder among first few jobs
            const additional = index < remainder ? 1 : 0;
            return {
              ...job,
              applicationCount: avgApplications + additional
            };
          });
        } else {
          // No applications, set all to 0
          recentJobs = recentJobs.map(job => ({
            ...job,
            applicationCount: 0
          }));
        }
      } else if (recentJobs.length > 0) {
        // If we couldn't get applications stats, set application count to 0 for all jobs
        recentJobs = recentJobs.map(job => ({
          ...job,
          applicationCount: 0
        }));
      }

      const fallback = {
        jobs: statsRes?.data?.data || {},
        applications: applicationsRes?.data?.data || {},
        company: profileRes?.data?.data?.company || null,
        recentActivity: recentJobs,
        notifications: null // We don't have notifications in fallback
      };

      console.log("[Dashboard Fallback] Final fallback data:", fallback);
      setFallbackStats(fallback);
    } catch (err) {
      console.error("Failed to load fallback dashboard data:", err);
      throw err;
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Dashboard"
        subtitle="Fetching your dashboard data..."
        steps={[
          { text: "Retrieving dashboard information", color: "blue" },
          { text: "Loading statistics", color: "purple" },
          { text: "Preparing interface", color: "green" }
        ]}
      />
    );
  }

  // Use fallback data if main dashboard failed
  const dataToDisplay = dashboardData || fallbackStats;

  // Show error messages if any
  if (errorMsg) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start">
        <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Recruiter Dashboard</h1>
            <p className="text-gray-400">Overview of your job postings and applications</p>
          </div>

          {/* Error Message */}
          <div className="mb-6 p-4 bg-red-500/20 text-red-300 text-sm rounded-lg border border-red-500/30 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="flex-shrink-0 hover:opacity-70 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Fallback Options */}
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 text-center">
            <p className="text-yellow-400">
              While we're experiencing issues with the main dashboard, you can still access your job management features:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a
                href="/recruiter/manage-jobs"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Manage Jobs
              </a>
              <a
                href="/recruiter/company-profile"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
              >
                Company Profile
              </a>
              <a
                href="/recruiter/applications"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
              >
                Applications
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dataToDisplay) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start">
        <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Recruiter Dashboard</h1>
            <p className="text-gray-400">Overview of your job postings and applications</p>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 text-center">
            <p className="text-yellow-400">No dashboard data available</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create a safe copy of the dashboard data with fallbacks
  const safeDashboardData = {
    jobs: dataToDisplay.jobs || {},
    applications: dataToDisplay.applications || {},
    company: company || dataToDisplay.company || null, // Prioritize separately fetched company data
    recentActivity: Array.isArray(dataToDisplay.recentActivity) ? dataToDisplay.recentActivity : [],
    notifications: dataToDisplay.notifications || null
  };

  const { jobs, applications, recentActivity, notifications } = safeDashboardData;
  
  // Debug company data
  console.log("[Dashboard Render] Company data being used:", safeDashboardData.company);
  console.log("[Dashboard Render] Company logo URL:", safeDashboardData.company?.logo);

  // Adjust stats based on available data
  const stats = [
    {
      label: "Total Jobs Posted",
      value: jobs?.total !== undefined ? jobs.total : "N/A",
      icon: <BriefcaseIcon className="w-5 h-5 text-blue-400" />,
    },
    {
      label: "Active Jobs",
      value: jobs?.active !== undefined ? jobs.active : "N/A",
      icon: <FileTextIcon className="w-5 h-5 text-green-400" />,
    },
    {
      label: "Total Applications",
      value: applications?.total !== undefined ? applications.total : "N/A",
      icon: <UsersIcon className="w-5 h-5 text-amber-400" />,
    },
    {
      label: "Pending Applications",
      value: applications?.pending !== undefined ? applications.pending : "N/A",
      icon: <ClockIcon className="w-5 h-5 text-purple-400" />,
    },
  ];

  const getDaysUntilExpiration = (expiresAt) => {
    if (!expiresAt) return null;

    const expirationDate = new Date(expiresAt);
    const today = new Date();
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start">
      <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Recruiter Dashboard</h1>
          <p className="text-gray-400">Overview of your job postings and applications</p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-500/20 text-green-300 text-sm rounded-lg border border-green-500/30 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="flex-1">{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="flex-shrink-0 hover:opacity-70 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/20 text-red-300 text-sm rounded-lg border border-red-500/30 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="flex-shrink-0 hover:opacity-70 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white/5 rounded-lg border border-white/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-xl font-semibold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Info */}
          {safeDashboardData.company && (
            <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <h2 className="text-xl font-semibold">Company Profile</h2>
                <p className="text-sm text-gray-400 mt-1">Your company information</p>
              </div>

              <div className="p-6">
                <div className="flex items-center">
                  {/* Company Logo Display - Increased size */}
                  <div className="w-32 h-32 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-white/30">
                    {safeDashboardData.company?.logo ? (
                      <img
                        src={safeDashboardData.company.logo}
                        alt="Company Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    {/* Increased company name size */}
                    <h3 className="text-2xl font-bold">{safeDashboardData.company.name || "Company Name"}</h3>
                    {/* Increased profile completion text size */}
                    <p className="text-lg text-gray-400">
                      Profile Completeness: {safeDashboardData.company.profileCompleteness !== undefined ? `${safeDashboardData.company.profileCompleteness}%` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => window.location.href = "/recruiter/company"}
                    className="px-4 py-2 font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => window.location.href = "/recruiter/jobs"}
                    className="px-4 py-2 font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 transition"
                  >
                    Manage Jobs
                  </button>
                </div>
              </div>

            </section>
          )}

          {/* Recent Jobs */}
          <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
              <h2 className="text-xl font-semibold">Recent Jobs</h2>
              <p className="text-sm text-gray-400 mt-1">Your latest job postings</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((job, index) => {
                      const daysUntilExpiration = getDaysUntilExpiration(job.expiresAt);
                      return (
                        <tr
                          key={job._id || job.id || index}
                          className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/2.5' : 'bg-white/5'}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium">{job.title || "Untitled Job"}</div>
                              <div className="text-sm text-gray-400">{job.role || "Role not specified"}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'active'
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : job.status === 'expired'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                              }`}>
                              {job.status || "Unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {job.applicationCount !== undefined ? job.applicationCount :
                              job.applications ? job.applications.length : "N/A"} applications
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <div className="text-gray-400">No jobs found</div>
                        <button
                          onClick={() => window.location.href = "/recruiter/jobs"}
                          className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                        >
                          Create your first job
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 border-t border-white/10 text-right">
              <button
                onClick={() => window.location.href = "/recruiter/jobs"}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all jobs →
              </button>
            </div>
          </section>
        </div>

        {/* Notifications - only show if notifications data exists */}
        {notifications && (
          <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden mt-6">
            <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-sm text-gray-400 mt-1">Recent system notifications</p>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">
                    You have {notifications.unread !== undefined ? notifications.unread : "N/A"} unread notifications
                  </p>
                  <p className="text-gray-400 text-sm">
                    Total: {notifications.total !== undefined ? notifications.total : "N/A"} notifications
                  </p>
                </div>
                <button
                  onClick={() => window.location.href = "/recruiter/notifications"}
                  className="px-4 py-2 font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition"
                >
                  View All
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Fallback notice if we're using fallback data */}
        {fallbackStats && !dashboardData && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center mt-6">
            <p className="text-yellow-400">
              Showing limited dashboard data. Some features may not be available until the main dashboard service is restored.
            </p>
            <button
              onClick={handleRetry}
              className="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
            >
              Try to Load Full Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}