// src/pages/student/StudentApplications.jsx
import { useState, useEffect } from "react";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";
import Message from "../../components/Message";
import {
  Briefcase as BriefcaseIcon,
  Calendar as CalendarIcon,
  Eye as EyeIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  X as XIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  UserCheck as UserCheckIcon,
  FileText as FileTextIcon
} from "../../components/CustomIcons";
import { formatDate } from "../../utils/formatUtils";

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    search: '',
    sortBy: 'createdAt',
    order: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
    loadApplications();
    loadStats();
  }, [filters]);

  async function loadApplications() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.order) queryParams.append('order', filters.order);

      const res = await api.get(`/applications/student?${queryParams.toString()}`);
      const data = res.data.data;
      setApplications(data.applications || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Error loading applications:', err);
      setErrorMsg('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await api.get("/applications/student/stats");
      setStats(res.data.data || {});
    } catch (err) {
      console.error('Error loading application stats:', err);
    }
  }

  async function withdrawApplication(applicationId) {
    setActionLoading(prev => ({ ...prev, [applicationId]: true }));
    try {
      await api.patch(`/applications/${applicationId}/withdraw`, {
        reason: "Withdrawn by student"
      });
      setApplications(prev => prev.map(app => 
        app._id === applicationId ? { ...app, status: 'withdrawn' } : app
      ));
      setSuccessMsg("Application withdrawn successfully");
      loadStats();
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setErrorMsg('Failed to withdraw application');
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
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
    const base = "px-2.5 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return `${base} bg-yellow-500/20 text-yellow-300 border border-yellow-500/30`;
      case 'reviewed':
        return `${base} bg-blue-500/20 text-blue-300 border border-blue-500/30`;
      case 'rejected':
        return `${base} bg-red-500/20 text-red-300 border border-red-500/30`;
      case 'withdrawn':
        return `${base} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
      default:
        return `${base} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading && applications.length === 0) {
    return (
      <LoadingScreen 
        title="Loading Applications"
        subtitle="Fetching your application history..."
        steps={[
          { text: "Retrieving applications", color: "blue" },
          { text: "Loading statistics", color: "purple" },
          { text: "Preparing interface", color: "green" }
        ]}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start">
      <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
        {/* Header - Responsive text sizing */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Applications</h1>
          <p className="text-gray-400 text-sm sm:text-base">Track the status of your job applications</p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <Message 
            type="success" 
            message={successMsg} 
            onClose={() => setSuccessMsg("")} 
          />
        )}

        {/* Error Message */}
        {errorMsg && (
          <Message 
            type="error" 
            message={errorMsg} 
            onClose={() => setErrorMsg("")} 
          />
        )}

        {/* Statistics Cards - Improved responsive grid */}
        {stats.overall && Object.keys(stats.overall).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Total</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">{stats.overall.total || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Pending</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">{stats.overall.pending || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Reviewed</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">{stats.overall.reviewed || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Rejected</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">{stats.overall.rejected || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Withdrawn</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">{stats.overall.withdrawn || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search - Improved responsive layout */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4 mb-5 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 rounded-lg bg-neutral-800 border border-white/10 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 rounded-lg bg-neutral-800 border border-white/10 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={`${filters.sortBy}-${filters.order}`}
                onChange={(e) => {
                  const [sortBy, order] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('order', order);
                }}
                className="w-full px-3 py-2 sm:py-2.5 rounded-lg bg-neutral-800 border border-white/10 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List - Improved responsive card layout */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <MiniLoader size="lg" color="blue" />
              <p className="text-gray-400 mt-2 text-sm sm:text-base">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              {/* Simple Icon */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              {/* Static Text */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl font-medium text-white mb-1 sm:mb-2">
                  No applications found
                </h3>
                
                <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                  {filters.search || filters.status 
                    ? "No applications match your current filters. Try adjusting your search criteria."
                    : "You haven't applied to any jobs yet. Start exploring opportunities!"
                  }
                </p>
                
                {/* Clear Filters Button */}
                {(filters.search || filters.status) && (
                  <div className="mt-3 sm:mt-4">
                    <button
                      onClick={() => setFilters({
                        page: 1,
                        limit: 10,
                        status: '',
                        search: '',
                        sortBy: 'createdAt',
                        order: 'desc'
                      })}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-all duration-200"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            applications.map(application => {
              return (
                <div 
                  key={application._id} 
                  className="p-4 sm:p-5 rounded-xl border bg-white/5 border-white/10 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-white text-base sm:text-lg mb-1">
                            {application.job?.title || "Untitled Job"}
                          </h3>
                          <p className="text-gray-300 text-xs sm:text-sm">
                            {application.job?.createdBy?.profile?.company || "Company not specified"}
                          </p>
                        </div>
                        
                        <span className={getStatusBadgeClass(application.status)}>
                          {formatStatus(application.status)}
                        </span>
                      </div>
                      
                      {/* Responsive grid for job details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Applied: {formatDate(application.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{application.job?.location || "Location not specified"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{application.job?.salary || "Salary not specified"}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-xs sm:text-sm mb-4 line-clamp-2">
                        {application.job?.description || "No description available"}
                      </p>
                      
                      {/* Skills section with responsive wrapping */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {application.job?.skills?.slice(0, 5).map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                        {application.job?.skills?.length > 5 && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-500/30">
                            +{application.job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons - Stacked on mobile, horizontal on larger screens */}
                    <div className="flex sm:flex-col gap-2 sm:gap-3 sm:items-end">
                      {application.status === 'pending' && (
                        <button
                          onClick={() => withdrawApplication(application._id)}
                          disabled={actionLoading[application._id]}
                          className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-red-600 to-red-700 border-0 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 w-full sm:w-auto"
                        >
                          {actionLoading[application._id] ? (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <MiniLoader size="xs" color="white" />
                              <span>Withdrawing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Withdraw</span>
                            </div>
                          )}
                        </button>
                      )}
                      
                      <button className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 transition w-full sm:w-auto">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination - Improved responsive layout */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 sm:mt-6 pt-4 border-t border-white/10">
            <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of {pagination.totalCount} applications
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg">
                {pagination.currentPage}
              </span>
              
              <button
                onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}