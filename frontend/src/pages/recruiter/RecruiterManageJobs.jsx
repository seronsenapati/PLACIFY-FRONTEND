import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { cachedApiCall } from "../../utils/cache"; // Added import for caching utility
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";
import Message from "../../components/Message";
import {
  Briefcase as BriefcaseIcon,
  Calendar as CalendarIcon,
  Edit3 as EditIcon,
  Trash2 as TrashIcon,
  Eye as EyeIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  X as XIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  UserCheck as UserCheckIcon,
  FileText as FileTextIcon,
  MapPin as MapPinIcon,
  Banknote as BanknoteIcon
} from "../../components/CustomIcons";
import { formatDate } from "../../utils/formatUtils";

export default function RecruiterManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // Track initial load
  const [actionLoading, setActionLoading] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    jobType: '',
    sortBy: 'createdAt',
    order: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState({});

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

  useEffect(() => {
    loadJobs();
    loadStats();
  }, [filters]);

  async function loadJobs() {
    try {
      // Show loading indicator for initial load
      if (initialLoad) {
        setLoading(true);
      }
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });

      // Use cachedApiCall for GET requests that benefit from caching
      const res = await cachedApiCall(
        () => api.get(`/jobs/recruiter/my-jobs?${queryParams.toString()}`),
        "/jobs/recruiter/my-jobs",
        { ...filters },
        { showCachedImmediately: !initialLoad } // Show cached immediately for non-initial loads
      );
      const data = res.data.data;
      setJobs(data.jobs || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalCount: data.totalJobs || 0
      });
    } catch (err) {
      console.error('Error loading jobs:', err);

      // Handle authentication errors
      if (err.response?.status === 401) {
        setErrorMsg('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setErrorMsg('Access denied. You do not have permission to view this resource.');
      } else {
        setErrorMsg('Failed to load jobs. Please try again later.');
      }
    } finally {
      setLoading(false);
      setInitialLoad(false); // Mark initial load as complete
    }
  }

  async function loadStats() {
    try {
      // Use cachedApiCall for GET requests that benefit from caching
      const res = await cachedApiCall(
        () => api.get("/jobs/recruiter/stats"),
        "/jobs/recruiter/stats",
        {},
        { showCachedImmediately: !initialLoad } // Show cached immediately for non-initial loads
      );
      setStats(res.data.data || {});
    } catch (err) {
      console.error('Error loading stats:', err);
      // We don't need to show an error message for stats loading failure
    }
  }

  // Check if recruiter has company profile
  async function checkCompanyProfile() {
    try {
      // Use cachedApiCall for GET requests that benefit from caching
      const res = await cachedApiCall(
        () => api.get("/profile"),
        "/profile"
      );
      const userData = res.data.data;
      console.log("User profile data:", userData);

      // For recruiters, check if they have a company association
      if (userData.role === "recruiter") {
        // Check if user has a company field that is not null/undefined
        if (userData.company) {
          // Company could be:
          // 1. A full company object with _id
          // 2. Just the company ID string
          // 3. An object with other properties
          console.log("Company data found:", userData.company);

          // If it's an object with _id, that's valid
          if (typeof userData.company === 'object' && userData.company._id) {
            console.log("Valid company found (object with _id):", userData.company._id);
            return true;
          }
          // If it's a string and not empty, that's valid
          else if (typeof userData.company === 'string' && userData.company.length > 0) {
            console.log("Valid company found (ID string):", userData.company);
            return true;
          }
          // If it's an object without _id but not null, it might be valid
          else if (typeof userData.company === 'object' && Object.keys(userData.company).length > 0) {
            console.log("Valid company found (object):", userData.company);
            return true;
          }
        }

        console.log("No valid company found for recruiter");
        return false;
      }

      // For admins, they can specify company when creating job
      if (userData.role === "admin") {
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error checking company profile:', err);
      return false;
    }
  }

  async function deleteJob(jobId) {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [jobId]: true }));
    try {
      await api.delete(`/jobs/${jobId}`);
      setSuccessMsg("Job deleted successfully");
      loadJobs();
      loadStats();
    } catch (err) {
      console.error('Error deleting job:', err);

      // Handle specific error cases
      if (err.response?.status === 401) {
        setErrorMsg('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setErrorMsg('Access denied. You do not have permission to delete this job.');
      } else if (err.response?.status === 404) {
        setErrorMsg('Job not found. It may have already been deleted.');
      } else {
        setErrorMsg('Failed to delete job. Please try again later.');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [jobId]: false }));
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const getStatusBadgeClass = (status) => {
    const base = "px-3 py-1.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'active':
        return `${base} bg-green-500/20 text-green-300 border border-green-500/30`;
      case 'inactive':
        return `${base} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
      case 'expired':
        return `${base} bg-red-500/20 text-red-300 border border-red-500/30`;
      default:
        return `${base} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
    }
  };

  const getJobTypeBadgeClass = (jobType) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    switch (jobType) {
      case 'full-time':
        return `${base} bg-blue-500/20 text-blue-300`;
      case 'part-time':
        return `${base} bg-purple-500/20 text-purple-300`;
      case 'internship':
        return `${base} bg-yellow-500/20 text-yellow-300`;
      case 'contract':
        return `${base} bg-green-500/20 text-green-300`;
      default:
        return `${base} bg-gray-500/20 text-gray-300`;
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    return `₹${salary.toLocaleString()}`;
  };

  const getDaysUntilExpiration = (expiresAt) => {
    if (!expiresAt) return null;

    const expirationDate = new Date(expiresAt);
    const today = new Date();
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getExpirationStatus = (expiresAt) => {
    const daysUntilExpiration = getDaysUntilExpiration(expiresAt);

    if (daysUntilExpiration === null) return { text: 'No expiration', color: 'text-gray-400' };

    if (daysUntilExpiration < 0) {
      return { text: 'Expired', color: 'text-red-400' };
    } else if (daysUntilExpiration <= 3) {
      return { text: `Expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}`, color: 'text-red-400' };
    } else if (daysUntilExpiration <= 7) {
      return { text: `Expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}`, color: 'text-yellow-400' };
    } else {
      return { text: `Expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}`, color: 'text-green-400' };
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <LoadingScreen
        title="Loading Jobs"
        subtitle="Fetching your job postings..."
        steps={[
          { text: "Retrieving job listings", color: "blue" },
          { text: "Loading statistics", color: "purple" },
          { text: "Preparing interface", color: "green" }
        ]}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start w-full">
      <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-5 sm:mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Manage Jobs</h1>
            <p className="text-gray-400 text-sm sm:text-base">Create, edit, and track your job postings</p>
          </div>
          <button
            onClick={() => { loadJobs(); loadStats(); }}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white disabled:opacity-50 transition flex items-center gap-1"
          >
            {loading ? (
              <>
                <MiniLoader />
                Refreshing...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>

        {/* Messages */}
        {successMsg && (
          <Message 
            type="success" 
            message={successMsg} 
            onClose={() => setSuccessMsg("")} 
          />
        )}
        {errorMsg && (
          <Message 
            type="error" 
            message={errorMsg} 
            onClose={() => setErrorMsg("")} 
          />
        )}

        {/* Loading indicator for non-initial loads */}
        {loading && !initialLoad && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Stats Cards */}
        {Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BriefcaseIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Total Jobs</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">{stats.totalJobs || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Active</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">{stats.jobsByStatus?.active || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Inactive</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">{stats.jobsByStatus?.inactive || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Expired</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">{stats.jobsByStatus?.expired || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, role, or location..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:col-span-3">
              {/* Status Filter */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Job Type Filter */}
              <div>
                <select
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Types</option>
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <MiniLoader size="lg" color="blue" />
              <p className="text-gray-400 mt-2">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BriefcaseIcon className="w-8 h-8 text-gray-400" />
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-medium text-white mb-2">
                  No jobs found
                </h3>

                <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                  {filters.search || filters.status || filters.jobType
                    ? "No jobs match your current filters. Try adjusting your search criteria."
                    : "You haven't posted any jobs yet. Create your first job posting to get started."
                  }
                </p>

                {/* Clear Filters Button */}
                {(filters.search || filters.status || filters.jobType) && (
                  <div className="mt-4">
                    <button
                      onClick={() => setFilters({
                        page: 1,
                        limit: 10,
                        search: '',
                        status: '',
                        jobType: '',
                        sortBy: 'createdAt',
                        order: 'desc'
                      })}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear filters
                    </button>
                  </div>
                )}

                {/* Create Job Button */}
                {!filters.search && !filters.status && !filters.jobType && (
                  <div className="mt-6">
                    <button
                      onClick={async () => {
                        // Refresh profile data and check if recruiter has company profile
                        console.log("Refreshing profile and checking company before creating job (no jobs found)...");
                        try {
                          // Force refresh the profile data
                          await api.get("/profile");
                          // Now check company profile
                          const hasCompany = await checkCompanyProfile();
                          console.log("Company profile check result:", hasCompany);
                          if (!hasCompany) {
                            setErrorMsg("You must create a company profile before posting jobs. Please create a company first.");
                            return;
                          }
                        } catch (err) {
                          console.error("Error refreshing profile:", err);
                          setErrorMsg("Error checking your profile. Please try again.");
                          return;
                        }
                        setCurrentJob(null);
                        setShowCreateModal(true);
                      }}
                      // Changed hover effect to blue
                      className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Create Your First Job
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            jobs.map(job => (
              <div
                key={job._id}
                className="p-5 rounded-xl border bg-white/5 border-white/10 transition-all duration-300 hover:border-white/20"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-white text-lg mb-1">
                          {job.title}
                        </h3>
                        <p className="text-gray-300">
                          {job.role} at {job.company?.name || "Your Company"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={getStatusBadgeClass(job.status)}>
                          {formatStatus(job.status)}
                        </span>
                        <span className={getJobTypeBadgeClass(job.jobType)}>
                          {job.jobType?.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        {/* Changed to BanknoteIcon */}
                        <BanknoteIcon className="w-4 h-4" />
                        <span>{formatSalary(job.salary)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Posted: {formatDate(job.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <ClockIcon className="w-4 h-4" />
                        <span>
                          {job.expiresAt
                            ? getExpirationStatus(job.expiresAt).text
                            : "No expiration"}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm line-clamp-2">
                      {job.desc}
                    </p>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.skills.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-500/30">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 md:items-end">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCurrentJob(job);
                          setShowEditModal(true);
                        }}
                        className="px-3 py-2 text-sm font-medium rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition flex items-center gap-1"
                      >
                        <EditIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => deleteJob(job._id)}
                        disabled={actionLoading[job._id]}
                        className="px-3 py-2 text-sm font-medium rounded-full bg-white/10 border border-white/30 text-white hover:bg-red-500/20 hover:border-red-500/50 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[job._id] ? (
                          <MiniLoader size="xs" color="red" />
                        ) : (
                          <TrashIcon className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        // Navigate to the applications page for this job
                        window.location.href = `/recruiter/applications?jobId=${job._id}`;
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition flex items-center gap-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Applications
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of {pagination.totalCount} jobs
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
                {pagination.currentPage}
              </span>

              <button
                onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Job Modal */}
      {(showCreateModal || showEditModal) && (
        <JobModal
          job={currentJob}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setCurrentJob(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setCurrentJob(null);
            setSuccessMsg(currentJob ? "Job updated successfully" : "Job created successfully");
            loadJobs();
            loadStats();
          }}
          onError={(message) => setErrorMsg(message)}
          checkCompanyProfile={checkCompanyProfile} // Pass the function as a prop
        />
      )}
    </div>
  );
}

// Job Modal Component
function JobModal({ job, onClose, onSave, onError, checkCompanyProfile }) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    role: job?.role || '',
    desc: job?.desc || '',
    location: job?.location || '',
    salary: job?.salary !== undefined && job?.salary !== null ? job.salary : '', // Handle 0 salary correctly
    skills: job?.skills?.join(', ') || '',
    jobType: job?.jobType || 'internship',
    experienceLevel: job?.experienceLevel || 'entry',
    isRemote: job?.isRemote || false,
    expiresAt: job?.expiresAt ? new Date(job.expiresAt).toISOString().split('T')[0] : '',
    applicationDeadline: job?.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : ''
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); // New state for AI generation
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // New function to generate job description using AI
  const generateJobDescription = async () => {
    // Validate that we have the required fields
    if (!formData.title.trim() || !formData.role.trim()) {
      onError("Please enter a job title and role before generating a description");
      return;
    }

    setAiLoading(true);
    try {
      // Prepare data for AI generation
      const requestData = {
        title: formData.title.trim(),
        role: formData.role.trim(),
        location: formData.location.trim(),
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        isRemote: Boolean(formData.isRemote),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      // Call the AI generation endpoint
      const res = await api.post("/jobs/generate-description", requestData);

      // Update the form data with the generated description
      setFormData(prev => ({
        ...prev,
        desc: res.data.data.description
      }));

      // Clear any previous errors for the description field
      setFieldErrors(prev => ({
        ...prev,
        desc: ''
      }));
    } catch (err) {
      console.error('Error generating job description:', err);

      // Handle different error cases
      if (err.response?.status === 401) {
        onError("Authentication required. Please log in again.");
      } else if (err.response?.status === 403) {
        onError("Access denied. You do not have permission to use this feature.");
      } else if (err.response?.data?.error?.message) {
        onError(err.response.data.error.message);
      } else {
        onError("Failed to generate job description. Please try again.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.title.trim()) {
      errors.title = 'Job title is required';
    } else if (formData.title.trim().length < 2) {
      errors.title = 'Title must be at least 2 characters';
    } else if (formData.title.trim().length > 100) {
      errors.title = 'Title cannot exceed 100 characters';
    }

    if (!formData.role.trim()) {
      errors.role = 'Role is required';
    } else if (formData.role.trim().length < 2) {
      errors.role = 'Role must be at least 2 characters';
    } else if (formData.role.trim().length > 100) {
      errors.role = 'Role cannot exceed 100 characters';
    }

    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }

    if (!formData.desc.trim()) {
      errors.desc = 'Job description is required';
    } else if (formData.desc.trim().length < 20) {
      errors.desc = 'Description must be at least 20 characters';
    } else if (formData.desc.trim().length > 2000) {
      errors.desc = 'Description cannot exceed 2000 characters';
    }

    // Salary is required in backend
    if (formData.salary === '' || formData.salary === undefined || formData.salary === null) {
      errors.salary = 'Salary is required';
    } else {
      const salaryValue = Number(formData.salary);
      if (isNaN(salaryValue) || salaryValue < 0) {
        errors.salary = 'Salary must be a valid positive number';
      }
    }

    if (!formData.skills.trim()) {
      errors.skills = 'At least one skill is required';
    } else {
      const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      if (skillsArray.length === 0) {
        errors.skills = 'At least one skill is required';
      } else if (skillsArray.length > 20) {
        errors.skills = 'Maximum 20 skills allowed';
      }
    }

    // Date validation
    if (formData.expiresAt && formData.applicationDeadline) {
      const expireDate = new Date(formData.expiresAt);
      const deadlineDate = new Date(formData.applicationDeadline);

      if (deadlineDate > expireDate) {
        errors.applicationDeadline = 'Application deadline cannot be after job expiration';
      }
    }

    // Add validation for expiration date to be in the future
    if (formData.expiresAt) {
      const expireDate = new Date(formData.expiresAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expireDate < today) {
        errors.expiresAt = 'Expiration date must be in the future';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check if recruiter has company profile before creating job
      if (!job) { // Only check for new jobs, not updates
        console.log("Checking company profile before job creation...");

        const hasCompany = await checkCompanyProfile();

        console.log("Company check result:", hasCompany);

        // If check fails, show error
        if (!hasCompany) {
          throw new Error('NO_COMPANY_PROFILE');
        }
      }

      // Prepare data for submission with proper formatting
      const submitData = {
        title: formData.title.trim(),
        role: formData.role.trim(),
        desc: formData.desc.trim(),
        location: formData.location.trim(),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0),
        jobType: formData.jobType || "internship",
        experienceLevel: formData.experienceLevel || "entry",
        isRemote: Boolean(formData.isRemote)
      };

      // Salary is required, so always include it
      const salaryValue = Number(formData.salary);
      if (!isNaN(salaryValue) && salaryValue >= 0) {
        submitData.salary = salaryValue;
      } else {
        // If salary is invalid, set it to 0
        submitData.salary = 0;
      }

      // Add optional fields only if they have values
      if (formData.expiresAt) {
        submitData.expiresAt = formData.expiresAt;
      }

      if (formData.applicationDeadline) {
        submitData.applicationDeadline = formData.applicationDeadline;
      }

      console.log('Submitting job data:', submitData);

      // Debug: Log the actual request being made
      console.log('Making API request...');
      if (job) {
        console.log('PATCH request to:', `/jobs/${job._id}`);
        console.log('Request data:', submitData);
        // Update existing job
        const response = await api.patch(`/jobs/${job._id}`, submitData);
        console.log('PATCH response:', response);
      } else {
        console.log('POST request to:', "/jobs");
        console.log('Request data:', submitData);
        // Create new job
        const response = await api.post("/jobs", submitData);
        console.log('POST response:', response);
      }

      onSave();
    } catch (err) {
      console.error('Error saving job:', err);
      console.error('Request failed with status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      console.error('Request details:', err.request);
      console.error('Config details:', err.config);

      // Handle company profile check error
      if (err.message === 'NO_COMPANY_PROFILE') {
        onError("You must create a company profile before posting jobs. Please create a company first.");
        return;
      }

      // Handle validation errors from backend
      if (err.response?.data?.error?.code === 'VALIDATION_001') {
        const backendErrors = err.response.data.data?.errors || [];
        const errors = {};

        backendErrors.forEach(error => {
          errors[error.field] = error.message;
        });

        setFieldErrors(errors);
        onError("Please correct the highlighted errors");
      } else if (err.response?.data?.error?.code === 'JOB_001') {
        // Handle missing required fields
        const missingFields = err.response.data.data?.missingFields || {};
        const errors = {};

        Object.keys(missingFields).forEach(field => {
          if (missingFields[field]) {
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
          }
        });

        setFieldErrors(errors);
        onError("Please fill in all required fields: " + Object.keys(missingFields).filter(field => missingFields[field]).join(", "));
      } else if (err.response?.data?.error?.code === 'JOB_002') {
        // Handle validation errors
        const field = err.response.data.data?.field;
        if (field) {
          setFieldErrors({
            [field]: `Invalid ${field}`
          });
          onError(`Please correct the ${field} field`);
        } else {
          onError("Invalid data provided");
        }
      } else if (err.response?.data?.error?.code === 'JOB_004') {
        // Handle company-related errors
        const message = err.response.data.data?.message || "You must create a company profile before posting jobs. Please verify your company profile is complete.";
        onError(message);
      } else if (err.response?.status === 400) {
        // Log detailed error information for debugging
        console.error('Bad Request Details:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          headers: err.response.headers
        });

        // Try to extract meaningful error message
        const errorMessage = err.response.data?.error?.message ||
          err.response.data?.message ||
          err.response.data?.data?.message ||
          err.response.data?.error ||
          "Invalid request. Please check your input and try again.";
        onError(errorMessage || "Invalid request. Please check your input and try again.");
      } else if (err.response?.status === 401) {
        onError("Authentication required. Please log in again.");
      } else if (err.response?.status === 403) {
        onError("Access denied. You do not have permission to perform this action.");
      } else if (err.response?.status === 500) {
        onError("Server error. Please try again later or contact support.");
      } else if (!err.response) {
        onError("Network error. Please check your connection and try again.");
      } else {
        onError(job ? "Failed to update job" : "Failed to create job");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {job ? "Edit Job" : "Create New Job"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg bg-neutral-800 border ${fieldErrors.title ? 'border-red-500' : 'border-white/10'
                    } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="e.g. Frontend Developer"
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-sm text-red-400">{fieldErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg bg-neutral-800 border ${fieldErrors.role ? 'border-red-500' : 'border-white/10'
                    } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="e.g. Software Engineer"
                />
                {fieldErrors.role && (
                  <p className="mt-1 text-sm text-red-400">{fieldErrors.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg bg-neutral-800 border ${fieldErrors.location ? 'border-red-500' : 'border-white/10'
                    } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="e.g. Mumbai, India"
                />
                {fieldErrors.location && (
                  <p className="mt-1 text-sm text-red-400">{fieldErrors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Salary (₹) *
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg bg-neutral-800 border ${fieldErrors.salary ? 'border-red-500' : 'border-white/10'
                    } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="e.g. 500000"
                />
                {fieldErrors.salary && (
                  <p className="mt-1 text-sm text-red-400">{fieldErrors.salary}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Experience Level
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Expiration Date
                </label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg bg-neutral-800 border ${fieldErrors.expiresAt ? 'border-red-500' : 'border-white/10'
                    } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                {fieldErrors.expiresAt && (
                  <p className="mt-1 text-sm text-red-400">{fieldErrors.expiresAt}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg bg-neutral-800 border ${fieldErrors.applicationDeadline ? 'border-red-500' : 'border-white/10'
                    } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                {fieldErrors.applicationDeadline && (
                  <p className="mt-1 text-sm text-red-400">{fieldErrors.applicationDeadline}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Skills (comma separated) *
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 rounded-lg bg-neutral-800 border ${fieldErrors.skills ? 'border-red-500' : 'border-white/10'
                  } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="e.g. JavaScript, React, CSS, HTML"
              />
              {fieldErrors.skills && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.skills}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-400">
                  Job Description *
                </label>
                <button
                  type="button"
                  onClick={generateJobDescription}
                  disabled={aiLoading || !formData.title.trim() || !formData.role.trim()}
                  className="text-xs px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {aiLoading ? (
                    <>
                      <MiniLoader size="xs" color="white" />
                      Generating...
                    </>
                  ) : (
                    "Generate with AI"
                  )}
                </button>
              </div>
              <textarea
                name="desc"
                value={formData.desc}
                onChange={handleChange}
                required
                rows={6}
                className={`w-full px-3 py-2 rounded-lg bg-neutral-800 border ${fieldErrors.desc ? 'border-red-500' : 'border-white/10'
                  } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="Describe the job responsibilities, requirements, and benefits..."
              />
              {fieldErrors.desc && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.desc}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.desc.length}/2000 characters
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isRemote"
                id="isRemote"
                checked={formData.isRemote}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-neutral-800 border-white/10 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="isRemote" className="ml-2 text-sm text-gray-400">
                This is a remote position
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <MiniLoader size="xs" color="white" />
                    {job ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{job ? "Update Job" : "Create Job"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}