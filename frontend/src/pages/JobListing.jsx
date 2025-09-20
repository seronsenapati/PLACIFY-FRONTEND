// src/pages/JobListing.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { isLoggedIn, getRole, logout } from "../utils/auth";
import LoadingScreen from "../components/LoadingScreen";
import {
  Search,
  MapPin,
  Building,
  Briefcase,
  Bookmark as BookmarkIcon,
  Clock,
  User,
  Banknote,
  AlertCircle as AlertCircleIcon,
  Users,
  Eye,
  Check
} from "lucide-react";

export default function JobListing() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [bookmarked, setBookmarked] = useState(new Set());
  const [applied, setApplied] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const navigate = useNavigate();

  const loggedIn = isLoggedIn();
  const role = getRole();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Fetch jobs, bookmarks, and applications in parallel
      const requests = [
        api.get('/jobs'),
        loggedIn && role === 'student' ? api.get('/bookmarks') : Promise.resolve({ data: [] })
      ];

      // Add applications request if user is a student
      if (loggedIn && role === 'student') {
        requests.push(api.get('/applications/student'));
      } else {
        requests.push(Promise.resolve({ data: [] }));
      }

      const [jobsRes, bookmarksRes, applicationsRes] = await Promise.all(requests);

      console.log('Jobs response:', jobsRes);
      console.log('Bookmarks response:', bookmarksRes);
      console.log('Applications response:', applicationsRes);

      // Extract jobs from the correct response structure
      let jobsData = [];
      if (jobsRes.data.data && Array.isArray(jobsRes.data.data.jobs)) {
        jobsData = jobsRes.data.data.jobs;
      } else if (jobsRes.data.jobs) {
        jobsData = jobsRes.data.jobs;
      } else if (Array.isArray(jobsRes.data)) {
        jobsData = jobsRes.data;
      } else if (jobsRes.data.data && Array.isArray(jobsRes.data.data)) {
        jobsData = jobsRes.data.data;
      }

      console.log('Processed jobs data:', jobsData);
      setJobs(jobsData);

      // Process bookmarks if user is a student
      if (loggedIn && role === 'student' && bookmarksRes.data) {
        const bookmarksData = Array.isArray(bookmarksRes.data)
          ? bookmarksRes.data
          : (bookmarksRes.data?.data || []);
        const bSet = new Set(bookmarksData.map((b) => b.jobId || b._id || b.id));
        setBookmarked(bSet);
      }

      // Process applications if user is a student
      if (loggedIn && role === 'student' && applicationsRes.data) {
        const applicationsData = applicationsRes.data.data?.applications || applicationsRes.data.data || [];
        console.log('Applications data:', applicationsData);
        const aSet = new Set(applicationsData.map((a) => a.job?._id || a.job?.id || a.jobId));
        setApplied(aSet);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        response: err.response,
        request: err.request
      });

      // Provide more specific error messages
      if (err.code === 'ECONNABORTED') {
        setError('Connection timeout. The server is taking too long to respond. Please try again later.');
      } else if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.statusText}`);
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    console.log('Handle apply called with jobId:', jobId);
    if (!loggedIn) {
      navigate('/login');
      return;
    }

    if (role !== 'student') {
      setError('Only students can apply for jobs');
      // Scroll to top to make error visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Check if user has already applied to this job
    if (applied.has(jobId)) {
      setError('You have already applied to this job');
      // Scroll to top to make error visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Close the job detail modal if it's open
    if (isModalOpen) {
      closeJobModal();
    }

    // Open the apply modal to collect resume and cover letter
    const job = jobs.find(j => (j._id || j.id) === jobId);
    console.log('Found job in jobs array:', job);
    setSelectedJobForApply(job);
    setIsApplyModalOpen(true);
  };

  const submitApplication = async (jobId) => {
    console.log('Submitting application for jobId:', jobId);
    if (!resume) {
      setError('Please select a resume to upload');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('resume', resume);
      if (coverLetter) {
        formData.append('coverLetter', coverLetter);
      }

      // Apply to job with resume upload
      const response = await api.post(`/jobs/${jobId}/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Close the apply modal
      setIsApplyModalOpen(false);
      setResume(null);
      setCoverLetter('');

      // Add job to applied set
      setApplied(prev => {
        const newApplied = new Set(prev);
        newApplied.add(jobId);
        return newApplied;
      });

      // Show success message
      setSuccess('Application submitted successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Error applying to job:', err);
      let errorMessage = '';
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 409) {
          // Handle both 400 and 409 errors for already applied cases
          // Check if the error message indicates already applied
          if (err.response.data && err.response.data.message &&
            typeof err.response.data.message === 'string' &&
            err.response.data.message.toLowerCase().includes('already')) {
            errorMessage = 'You have already applied to this job';
          } else if (err.response.data && err.response.data.error &&
            typeof err.response.data.error === 'string' &&
            err.response.data.error.toLowerCase().includes('already')) {
            // Check if error is in the 'error' field instead
            errorMessage = 'You have already applied to this job';
          } else if (typeof err.response.data === 'string' &&
            err.response.data.toLowerCase().includes('already')) {
            // Check if the entire response is a string containing 'already'
            errorMessage = 'You have already applied to this job';
          } else if (JSON.stringify(err.response.data).toLowerCase().includes('already')) {
            // Check if 'already' appears anywhere in the response
            errorMessage = 'You have already applied to this job';
          } else {
            // For 409 errors, it's definitely already applied
            if (err.response.status === 409) {
              errorMessage = 'You have already applied to this job';
            } else {
              // For other 400 errors, show a more generic message
              errorMessage = 'Unable to apply for this job. Please try again later.';
            }
          }
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
          logout(); // Clear invalid auth data
          navigate('/login');
        } else if (err.response.status === 403) {
          errorMessage = 'Access denied. Only students can apply for jobs.';
        } else if (err.response.status === 404) {
          errorMessage = 'Job not found.';
        } else {
          errorMessage = `Server error: ${err.response.status} - ${err.response.statusText}`;
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = 'Failed to apply for job. Please try again.';
      }

      setError(errorMessage);
      // Scroll to top to make error visible
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const toggleBookmark = async (job) => {
    const jobId = job._id || job.id;
    console.log('Toggle bookmark for job:', jobId);

    if (!loggedIn) {
      console.log('User not logged in, redirecting to login');
      navigate('/login');
      return;
    }

    if (role !== 'student') {
      console.log('User is not a student, showing error');
      setError('Only students can bookmark jobs');
      // Scroll to top to make error visible
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
      return;
    }

    try {
      if (bookmarked.has(jobId)) {
        console.log('Removing bookmark for job:', jobId);
        // Remove bookmark
        await api.delete(`/bookmarks/${jobId}`);
        setBookmarked(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        setSuccess('Job removed from bookmarks');
      } else {
        console.log('Adding bookmark for job:', jobId);
        // Add bookmark
        await api.post(`/bookmarks/${jobId}`);
        setBookmarked(prev => new Set(prev).add(jobId));
        setSuccess('Job bookmarked successfully');
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Error bookmarking job:', err);
      let errorMessage = '';
      if (err.response && err.response.status === 409) {
        errorMessage = 'Job is already bookmarked';
      } else {
        errorMessage = 'Failed to update bookmark. Please try again.';
      }

      setError(errorMessage);
      // Scroll to top to make error visible
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const openJobModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeJobModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #ffffff14 0%, rgba(255, 255, 255, 0.12) 19%, rgba(255, 255, 255, 0.05) 28%, transparent 35%, transparent 100%), linear-gradient(to bottom, #18181b, #000000)",
        }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-green-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        <div className="relative z-10">
          <LoadingScreen
            title="Loading Jobs"
            subtitle="Fetching the latest job opportunities..."
            steps={[
              { text: "Retrieving job listings", color: "blue" },
              { text: "Loading job details", color: "purple" },
              { text: "Preparing interface", color: "green" }
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden pt-15"
      style={{
        background:
          "linear-gradient(135deg, #ffffff14 0%, rgba(255, 255, 255, 0.12) 19%, rgba(255, 255, 255, 0.05) 28%, transparent 35%, transparent 100%), linear-gradient(to bottom, #18181b, #000000)",
      }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-green-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex justify-center items-start w-full p-2">
        <div className="w-full max-w-1xl mx-auto p-4 bg-black/20 rounded-lg min-h-[calc(100vh-6rem)]">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Job Listings</h1>
            <p className="text-gray-400">Explore available job opportunities and apply today</p>
          </div>

          {/* Error Messages Only */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 text-red-300 text-sm rounded-lg border border-red-500/30 flex items-center gap-3 animate-pulse">
              <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="flex-shrink-0 hover:opacity-70 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Success Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 text-green-300 text-sm rounded-lg border border-green-500/30 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="flex-1">{success}</span>
              <button onClick={() => setSuccess(null)} className="flex-shrink-0 hover:opacity-70 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No jobs available</h3>
              <p className="text-gray-400 mb-6">Check back later for new opportunities</p>
              <button
                onClick={fetchJobs}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const jobId = job._id || job.id;
                const isBookmarked = bookmarked.has(jobId);
                const isApplied = applied.has(jobId);
                return (
                  <div
                    key={jobId}
                    className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                            <p className="text-gray-300">{job.company?.name || job.createdBy?.name || 'Company Name'}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{job.location || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300 capitalize">{job.jobType || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300 capitalize">{job.experienceLevel || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Banknote className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{job.salary ? `₹${job.salary.toLocaleString()}` : 'Not disclosed'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">
                              {job.role || 'Role not specified'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.skills && job.skills.slice(0, 5).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                              {skill}
                            </span>
                          ))}
                          {job.skills && job.skills.length > 5 && (
                            <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 ml-4">
                        {role === 'student' && (
                          <button
                            onClick={() => toggleBookmark(job)}
                            className={`p-2 rounded-lg border ${isBookmarked
                              ? "border-yellow-400 text-yellow-300 bg-yellow-400/10"
                              : "border-white/30 text-white bg-white/10"
                              }`}
                            title={isBookmarked ? "Remove bookmark" : "Bookmark job"}
                          >
                            <BookmarkIcon className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
                          </button>
                        )}
                        <button
                          onClick={() => openJobModal(job)}
                          className="px-4 py-2 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        {role === 'student' && (
                          <button
                            onClick={() => handleApply(jobId)}
                            disabled={isApplied}
                            className={`px-4 py-2 font-semibold rounded-full border transition flex items-center justify-center ${isApplied
                              ? "bg-green-500/20 border-green-500/50 text-green-300 cursor-not-allowed"
                              : "bg-white/10 border-white/30 text-white hover:bg-green-500/20 hover:border-green-500/50"
                              }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span>Applied</span>
                              </>
                            ) : (
                              "Apply Now"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Job Detail Modal */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {selectedJob.title}
                </h2>
                <button
                  onClick={closeJobModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Company Info */}
                <div className="flex items-start gap-4 pb-4 border-b border-white/10">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {selectedJob.company?.name || selectedJob.createdBy?.name || 'Company Name'}
                    </h3>
                    <p className="text-gray-400">
                      {selectedJob.company?.industry || 'Industry not specified'}
                    </p>
                  </div>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Location</p>
                      <p className="text-white">{selectedJob.location || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Job Type</p>
                      <p className="text-white capitalize">{selectedJob.jobType || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <User className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Experience</p>
                      <p className="text-white capitalize">{selectedJob.experienceLevel || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Banknote className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Salary</p>
                      <p className="text-white">
                        {selectedJob.salary ? `₹${selectedJob.salary.toLocaleString()}` : 'Not disclosed'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Role</p>
                      <p className="text-white">{selectedJob.role || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Posted</p>
                      <p className="text-white">
                        {selectedJob.createdAt
                          ? new Date(selectedJob.createdAt).toLocaleDateString()
                          : 'Date not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Job Description</h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-line">
                      {selectedJob.desc || selectedJob.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  {role === 'student' && (
                    <button
                      onClick={() => {
                        toggleBookmark(selectedJob);
                      }}
                      className={`px-4 py-2.5 font-semibold rounded-lg transition ${bookmarked.has(selectedJob._id || selectedJob.id)
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                        : "bg-white/10 text-white border border-white/30 hover:bg-white/20"
                        }`}
                    >
                      {bookmarked.has(selectedJob._id || selectedJob.id) ? "Bookmarked" : "Bookmark"}
                    </button>
                  )}
                  {role === 'student' && (
                    <button
                      onClick={() => {
                        const jobId = selectedJob._id || selectedJob.id;
                        if (applied.has(jobId)) {
                          setError('You have already applied to this job');
                          // Scroll to top to make error visible
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          closeJobModal();
                          handleApply(jobId);
                        }
                      }}
                      disabled={applied.has(selectedJob._id || selectedJob.id)}
                      className={`px-4 py-2.5 font-semibold rounded-lg border transition flex items-center justify-center ${applied.has(selectedJob._id || selectedJob.id)
                        ? "bg-green-500/20 border-green-500/50 text-green-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-500 text-white"
                        }`}
                    >
                      {applied.has(selectedJob._id || selectedJob.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>Applied</span>
                        </>
                      ) : (
                        "Apply Now"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {isApplyModalOpen && selectedJobForApply && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-white/10 rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Apply for {selectedJobForApply.title}
                </h2>
                <button
                  onClick={() => {
                    setIsApplyModalOpen(false);
                    setResume(null);
                    setCoverLetter('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resume (PDF or DOCX, max 10MB)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => setResume(e.target.files[0])}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {resume && (
                    <p className="mt-2 text-sm text-gray-400">
                      Selected: {resume.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell the employer why you're a good fit for this position..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsApplyModalOpen(false);
                      setResume(null);
                      setCoverLetter('');
                    }}
                    className="flex-1 px-4 py-2.5 font-semibold rounded-lg bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitApplication(selectedJobForApply._id || selectedJobForApply.id)}
                    className="flex-1 px-4 py-2.5 font-semibold rounded-lg bg-green-600 hover:bg-green-500 text-white transition"
                  >
                    Submit Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}