import { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";

export default function RecruiterApplications() {
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
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
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
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      loadApplications();
    }
  }, [selectedJob, filters]);

  async function loadJobs() {
    try {
      // Use the correct endpoint to get recruiter's jobs
      const res = await api.get("/jobs/recruiter/my-jobs");
      // Ensure jobs is always an array by accessing data.jobs
      const jobsData = Array.isArray(res.data.data.jobs) ? res.data.data.jobs : [];
      setJobs(jobsData);
      // Select the first job by default if available
      if (jobsData.length > 0) {
        setSelectedJob(jobsData[0]._id);
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
      setErrorMsg('Failed to load jobs');
      // Ensure jobs is always an array even on error
      setJobs([]);
    } finally {
      // Always set loading to false after attempting to load jobs
      if (loading) {
        setLoading(false);
      }
    }
  }

  async function loadApplications() {
    if (!selectedJob) return;
    
    // Only set loading to true when actively loading applications, not jobs
    const wasLoading = loading;
    if (!wasLoading) {
      setLoading(true);
    }
    
    try {
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.order) queryParams.append('order', filters.order);

      // Use the correct endpoint for job applications
      const res = await api.get(`/applications/job/${selectedJob}?${queryParams.toString()}`);
      const data = res.data.data;
      setApplications(data.applications || []);
      setPagination(data.pagination || {});
      // Extract statistics from the statistics field in the response
      setStats(data.statistics || {});
    } catch (err) {
      console.error('Error loading applications:', err);
      setErrorMsg('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    // Stats are now loaded with applications, so this function can be empty or removed
    // The statistics are included in the response from /applications/job/:jobId
  }

  async function updateApplicationStatus(applicationId, status, reason = "") {
    setActionLoading(prev => ({ ...prev, [applicationId]: true }));
    try {
      await api.patch(`/applications/${applicationId}`, {
        status,
        reason
      });
      
      setApplications(prev => prev.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ));
      setSuccessMsg(`Application ${status} successfully`);
      // Reload applications to get updated stats
      loadApplications();
    } catch (err) {
      console.error(`Error updating application status to ${status}:`, err);
      // Check if it's the specific error about withdrawn status
      if (err.response?.data?.error?.message?.includes("withdrawn")) {
        setErrorMsg("You cannot set an application to withdrawn status. Applicants must withdraw their own applications.");
      } else {
        setErrorMsg(`Failed to ${status} application`);
      }
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
    const base = "px-3 py-1.5 rounded-full text-xs font-medium";
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading screen only when initially loading (no jobs or applications loaded yet)
  if (loading && Array.isArray(jobs) && jobs.length === 0 && applications.length === 0) {
    return (
      <LoadingScreen 
        title="Loading Applications"
        subtitle="Fetching job applications..."
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Job Applications</h1>
          <p className="text-gray-400">Review and manage applications for your job postings</p>
        </div>

        {/* Job Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Select Job Posting</label>
          <select
            value={selectedJob || ""}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Select a job posting</option>
            {Array.isArray(jobs) && jobs.map(job => (
              <option key={job._id} value={job._id}>
                {job.title} at {job.company?.name || "Company not specified"}
              </option>
            ))}
          </select>
        </div>

        {!selectedJob ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Job Selected</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Please select a job posting from the dropdown above to view applications.
            </p>
          </div>
        ) : (
          <>
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

            {/* Statistics Cards */}
            {Object.keys(stats).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total</p>
                      <p className="text-xl font-semibold text-white">{stats.total || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Pending</p>
                      <p className="text-xl font-semibold text-white">{stats.pending || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Reviewed</p>
                      <p className="text-xl font-semibold text-white">{stats.reviewed || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Rejected</p>
                      <p className="text-xl font-semibold text-white">{stats.rejected || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Withdrawn</p>
                      <p className="text-xl font-semibold text-white">{stats.withdrawn || 0}</p>
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
                  <input
                    type="text"
                    placeholder="Search by applicant name or email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn (Student-initiated)</option>
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
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="status-asc">Status (A-Z)</option>
                    <option value="status-desc">Status (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <MiniLoader size="lg" color="blue" />
                  <p className="text-gray-400 mt-2">Loading applications...</p>
                </div>
              ) : Array.isArray(applications) && applications.length === 0 ? (
                <div className="text-center py-12">
                  {/* Simple Icon */}
                  <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  {/* Static Text */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-medium text-white mb-2">
                      No applications found
                    </h3>
                    
                    <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                      {filters.search || filters.status 
                        ? "No applications match your current filters. Try adjusting your search criteria."
                        : "No applications have been submitted for this job yet."
                      }
                    </p>
                    
                    {/* Clear Filters Button */}
                    {(filters.search || filters.status) && (
                      <div className="mt-4">
                        <button
                          onClick={() => setFilters({
                            page: 1,
                            limit: 10,
                            status: '',
                            search: '',
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
                  </div>
                </div>
              ) : (
                Array.isArray(applications) && applications.map(application => {
                  return (
                    <div 
                      key={application._id} 
                      className="p-5 rounded-xl border bg-white/5 border-white/10 transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Applicant Info */}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                            <div>
                              <h3 className="font-semibold text-white text-lg mb-1">
                                {application.student?.name || "Applicant"}
                              </h3>
                              <p className="text-gray-300 text-sm">
                                {application.student?.email || "Email not provided"}
                              </p>
                            </div>
                            
                            <span className={getStatusBadgeClass(application.status)}>
                              {formatStatus(application.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                            <div className="flex items-center gap-2 text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Applied: {formatDate(application.createdAt)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{application.daysSinceApplication || 0} days ago</span>
                            </div>
                          </div>
                          
                          {application.coverLetter && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-400 mb-1">Cover Letter</h4>
                              <p className="text-gray-300 text-sm bg-black/20 p-3 rounded-lg border border-white/10">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {application.student?.profile?.skills?.slice(0, 5).map((skill, index) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                              >
                                {skill}
                              </span>
                            ))}
                            {application.student?.profile?.skills?.length > 5 && (
                              <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-500/30">
                                +{application.student.profile.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 md:items-end">
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateApplicationStatus(application._id, 'reviewed')}
                                disabled={actionLoading[application._id]}
                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                              >
                                {actionLoading[application._id] ? (
                                  <div className="flex items-center gap-2">
                                    <MiniLoader size="xs" color="white" />
                                    <span>Reviewing...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Mark as Reviewed
                                  </div>
                                )}
                              </button>
                              
                              <button
                                onClick={() => updateApplicationStatus(application._id, 'rejected')}
                                disabled={actionLoading[application._id]}
                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-red-600 to-red-700 border-0 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                              >
                                {actionLoading[application._id] ? (
                                  <div className="flex items-center gap-2">
                                    <MiniLoader size="xs" color="white" />
                                    <span>Rejecting...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject Application
                                  </div>
                                )}
                              </button>
                            </>
                          )}
                          
                          <div className="flex gap-2">
                            {application.resumeUrl && (
                              <a 
                                href={application.resumeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 transition"
                              >
                                View Resume
                              </a>
                            )}
                            
                            <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 transition">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="text-sm text-gray-400">
                  Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of {pagination.totalCount} applications
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-2 text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
                    {pagination.currentPage}
                  </span>
                  
                  <button
                    onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-2 text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}