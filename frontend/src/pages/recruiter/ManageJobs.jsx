import { useState, useEffect } from "react";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    jobType: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc"
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    role: "",
    desc: "",
    location: "",
    salary: "",
    skills: "",
    jobType: "internship",
    experienceLevel: "entry",
    isRemote: false,
    applicationDeadline: ""
  });

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
  }, [filters]);

  async function loadJobs() {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.jobType) queryParams.append('jobType', filters.jobType);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.order) queryParams.append('order', filters.order);

      const res = await api.get(`/jobs/recruiter/my-jobs?${queryParams.toString()}`);
      const data = res.data.data;
      setJobs(data.jobs || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Error loading jobs:', err);
      setErrorMsg('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newJob.title.trim()) {
      setErrorMsg('Job title is required');
      return;
    }
    
    if (!newJob.role.trim()) {
      setErrorMsg('Role is required');
      return;
    }
    
    if (!newJob.desc.trim()) {
      setErrorMsg('Description is required');
      return;
    }
    
    if (!newJob.location.trim()) {
      setErrorMsg('Location is required');
      return;
    }
    
    if (!newJob.salary || Number(newJob.salary) <= 0) {
      setErrorMsg('Valid salary is required');
      return;
    }
    
    if (!newJob.skills.trim()) {
      setErrorMsg('At least one skill is required');
      return;
    }
    
    setActionLoading({ create: true });
    
    try {
      const jobData = {
        ...newJob,
        salary: Number(newJob.salary),
        skills: newJob.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };
      
      await api.post("/jobs", jobData);
      setSuccessMsg("Job created successfully");
      setShowCreateForm(false);
      setNewJob({
        title: "",
        role: "",
        desc: "",
        location: "",
        salary: "",
        skills: "",
        jobType: "internship",
        experienceLevel: "entry",
        isRemote: false,
        applicationDeadline: ""
      });
      loadJobs(); // Refresh the job list
    } catch (err) {
      console.error('Error creating job:', err);
      // More detailed error handling
      if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else if (err.response?.data?.errors) {
        // Handle validation errors array
        const errorMessages = err.response.data.errors.map(error => error.msg || error.message).join(', ');
        setErrorMsg(errorMessages || 'Failed to create job');
      } else if (err.response?.status === 400) {
        setErrorMsg('Invalid job data. Please check all required fields.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to create job');
      }
    } finally {
      setActionLoading({ create: false });
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    
    setActionLoading(prev => ({ ...prev, [jobId]: true }));
    
    try {
      await api.delete(`/jobs/${jobId}`);
      setSuccessMsg("Job deleted successfully");
      loadJobs(); // Refresh the job list
    } catch (err) {
      console.error('Error deleting job:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to delete job');
    } finally {
      setActionLoading(prev => ({ ...prev, [jobId]: false }));
    }
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

  if (loading && jobs.length === 0) {
    return (
      <LoadingScreen 
        title="Loading Jobs"
        subtitle="Fetching your job postings..."
        steps={[
          { text: "Retrieving jobs", color: "blue" },
          { text: "Loading details", color: "purple" },
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Manage Jobs</h1>
              <p className="text-gray-400">Create, edit, and manage your job postings</p>
            </div>
          </div>
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

        {/* Create Job Form */}
        {showCreateForm && (
          <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Create New Job</h2>
            <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Job Title * <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. Software Engineer Intern"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Role * <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newJob.role}
                  onChange={(e) => setNewJob({...newJob, role: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. Engineering"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Description * <span className="text-red-400">*</span></label>
                <textarea
                  value={newJob.desc}
                  onChange={(e) => setNewJob({...newJob, desc: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Detailed job description..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Location * <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newJob.location}
                  onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. New York, NY"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Salary * <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={newJob.salary}
                  onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. 50000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Skills * <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newJob.skills}
                  onChange={(e) => setNewJob({...newJob, skills: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. JavaScript, React, Node.js (comma separated)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Job Type</label>
                <select
                  value={newJob.jobType}
                  onChange={(e) => setNewJob({...newJob, jobType: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Experience Level</label>
                <select
                  value={newJob.experienceLevel}
                  onChange={(e) => setNewJob({...newJob, experienceLevel: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead Level</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Application Deadline</label>
                <input
                  type="date"
                  value={newJob.applicationDeadline}
                  onChange={(e) => setNewJob({...newJob, applicationDeadline: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRemote"
                  checked={newJob.isRemote}
                  onChange={(e) => setNewJob({...newJob, isRemote: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isRemote" className="ml-2 text-sm text-gray-400">Remote Work Available</label>
              </div>
              
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-red-500/20 hover:border-red-500/50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.create}
                  className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading.create ? (
                    <>
                      <MiniLoader size="xs" color="white" />
                      Creating...
                    </>
                  ) : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Jobs List - Only show when not creating a job */}
        {!showCreateForm && (
          <>
            {/* Create Job Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition"
              >
                Create New Job
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white/5 rounded-lg border border-white/10 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
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
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                  </select>
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
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-medium text-white mb-2">
                      No jobs found
                    </h3>
                    
                    <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                      {filters.search || filters.status || filters.jobType 
                        ? "No jobs match your current filters. Try adjusting your search criteria."
                        : "You haven't created any job postings yet."
                      }
                    </p>
                    
                    {!filters.search && !filters.status && !filters.jobType && (
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="mt-4 py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition"
                      >
                        Create Your First Job
                      </button>
                    )}
                    
                    {/* Clear Filters Button */}
                    {(filters.search || filters.status || filters.jobType) && (
                      <div className="mt-4">
                        <button
                          onClick={() => setFilters({
                            search: '',
                            status: '',
                            jobType: '',
                            page: 1,
                            limit: 10,
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
                jobs.map(job => (
                  <div 
                    key={job._id} 
                    className="p-5 rounded-xl border bg-white/5 border-white/10 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-white text-lg mb-1">
                              {job.title}
                            </h3>
                            <p className="text-gray-300 text-sm">
                              {job.role} • {job.company?.name || "Company not specified"}
                            </p>
                          </div>
                          
                          <span className={getStatusBadgeClass(job.status)}>
                            {formatStatus(job.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{job.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>${job.salary.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                            <span className="capitalize">{job.jobType}</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {job.desc}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {job.skills?.slice(0, 5).map((skill, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills?.length > 5 && (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-500/30">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 md:items-end">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // TODO: Implement edit functionality
                              alert("Edit functionality to be implemented");
                            }}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 transition"
                          >
                            Edit
                          </button>
                          
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            disabled={actionLoading[job._id]}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 transition disabled:opacity-50 flex items-center gap-1"
                          >
                            {actionLoading[job._id] ? (
                              <MiniLoader size="xs" color="red" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            Delete
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <a 
                            href={`/recruiter/applications?jobId=${job._id}`}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition"
                          >
                            View Applications
                          </a>
                          
                          <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 transition">
                            Preview
                          </button>
                        </div>
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