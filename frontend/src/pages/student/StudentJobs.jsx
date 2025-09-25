// src/pages/student/StudentJobs.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { cachedApiCall } from "../../utils/cache";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";
import Message from "../../components/Message";
import { 
  Search, 
  MapPin, 
  Building, 
  Briefcase, 
  Bookmark as BookmarkIcon,
  User,
  Banknote,
  Users,
  Eye,
  Check,
  Clock,
  X
} from "lucide-react";

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [bookmarked, setBookmarked] = useState(new Set());
  const [applied, setApplied] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [applying, setApplying] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Add new state variables for the apply modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const navigate = useNavigate();
  
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
    (async () => {
      try {
        // Fetch jobs, bookmarks, and applications in parallel with caching
        const requests = [
          cachedApiCall(
            () => api.get("/jobs"),
            "/jobs"
          ),
          cachedApiCall(
            () => api.get("/bookmarks"),
            "/bookmarks"
          ),
          cachedApiCall(
            () => api.get("/applications/student"),
            "/applications/student"
          )
        ];
        
        const [jobsRes, bookmarksRes, applicationsRes] = await Promise.all(requests);
        
        // Process jobs data
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
        setJobs(jobsData);
        
        // Process bookmarks data
        const bookmarksData = Array.isArray(bookmarksRes.data) 
          ? bookmarksRes.data 
          : (bookmarksRes.data?.data || []);
        const bSet = new Set(bookmarksData.map((b) => b.jobId || b._id || b.id));
        setBookmarked(bSet);
        
        // Process applications data
        const applicationsData = applicationsRes.data.data?.applications || applicationsRes.data.data || [];
        const aSet = new Set(applicationsData.map((a) => a.job?._id || a.job?.id || a.jobId));
        setApplied(aSet);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load jobs");
        setJobs([]); // Set to empty array on error
        setBookmarked(new Set()); // Reset bookmarks on error
        setApplied(new Set()); // Reset applications on error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    // Ensure jobs is an array before filtering
    if (!Array.isArray(jobs)) {
      return [];
    }
    
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      const okQ = !q || (j.title && j.title.toLowerCase().includes(q)) || (j.company?.name && j.company.name.toLowerCase().includes(q)) || (j.createdBy?.name && j.createdBy.name.toLowerCase().includes(q));
      const okLoc = !location || (j.location && j.location.toLowerCase().includes(location.toLowerCase()));
      const okType = !type || (j.jobType && j.jobType.toLowerCase() === type.toLowerCase());
      return okQ && okLoc && okType;
    });
  }, [jobs, query, location, type]);

  const toggleBookmark = async (job) => {
    const id = job.id || job._id;
    try {
      if (bookmarked.has(id)) {
        await api.delete(`/bookmarks/${id}`);
        setBookmarked(prev => {
          const s = new Set(prev); s.delete(id); return s;
        });
        setSuccessMsg("Job removed from saved jobs");
      } else {
        await api.post(`/bookmarks/${id}`);
        setBookmarked(prev => new Set(prev).add(id));
        setSuccessMsg("Job saved successfully");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update saved jobs");
    }
  };

  const handleApply = async (jobId) => {
    // Check if user has already applied to this job
    if (applied.has(jobId)) {
      setErrorMsg('You have already applied to this job');
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Close the job detail modal if it's open
    if (isModalOpen) {
      setIsModalOpen(false);
    }
    
    // Open the apply modal to collect resume and cover letter
    const job = jobs.find(j => (j._id || j.id) === jobId);
    setSelectedJobForApply(job);
    setIsApplyModalOpen(true);
  };

  const submitApplication = async (jobId) => {
    console.log('Submitting application for jobId:', jobId);
    
    // Validate jobId
    if (!jobId) {
      setErrorMsg('Invalid job ID. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (!resume) {
      setErrorMsg('Please select a resume to upload');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setApplying(jobId);
    try {
      const formData = new FormData();
      formData.append('resume', resume);
      if (coverLetter) {
        formData.append('coverLetter', coverLetter);
      }
      
      // Apply to job with resume upload
      await api.post(`/jobs/${jobId}/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Close the apply modal
      setIsApplyModalOpen(false);
      setResume(null);
      setCoverLetter('');
      
      // Add job to applied set
      setApplied(prev => new Set(prev).add(jobId));
      setSuccessMsg("Application submitted successfully");
    } catch (err) {
      console.error(err);
      let errorMessage = '';
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 409) {
          // Handle both 400 and 409 errors for already applied cases
          if (err.response.data && err.response.data.message && 
              typeof err.response.data.message === 'string' &&
              err.response.data.message.toLowerCase().includes('already')) {
            errorMessage = 'You have already applied to this job';
          } else if (err.response.data && err.response.data.error && 
                     typeof err.response.data.error === 'string' &&
                     err.response.data.error.toLowerCase().includes('already')) {
            errorMessage = 'You have already applied to this job';
          } else if (typeof err.response.data === 'string' && 
                     err.response.data.toLowerCase().includes('already')) {
            errorMessage = 'You have already applied to this job';
          } else if (JSON.stringify(err.response.data).toLowerCase().includes('already')) {
            errorMessage = 'You have already applied to this job';
          } else {
            if (err.response.status === 409) {
              errorMessage = 'You have already applied to this job';
            } else {
              errorMessage = 'Unable to apply for this job. Please try again later.';
            }
          }
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
          localStorage.removeItem('token');
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
      setErrorMsg(errorMessage);
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setApplying(null);
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <LoadingScreen 
        title="Loading Jobs"
        subtitle="Fetching the latest job opportunities..."
        steps={[
          { text: "Retrieving job listings", color: "blue" },
          { text: "Loading job details", color: "purple" },
          { text: "Preparing interface", color: "green" }
        ]}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start w-full">
      <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
        {/* Header - Responsive text sizing */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Available Jobs</h1>
          <p className="text-gray-400 text-sm sm:text-base">Browse and apply to job opportunities</p>
        </div>

        {/* Messages - Responsive padding and text sizing */}
        {errorMsg && (
          <Message 
            type="error" 
            message={errorMsg} 
            onClose={() => setErrorMsg("")} 
          />
        )}
        
        {successMsg && (
          <Message 
            type="success" 
            message={successMsg} 
            onClose={() => setSuccessMsg("")} 
          />
        )}

        {/* Filters - Improved responsive layout */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4 mb-5 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                value={query} 
                onChange={(e)=>setQuery(e.target.value)} 
                placeholder="Search title, company..."
                className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 rounded-lg bg-transparent border border-white/10 text-white text-sm sm:text-base focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                value={location} 
                onChange={(e)=>setLocation(e.target.value)} 
                placeholder="Location"
                className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 rounded-lg bg-transparent border border-white/10 text-white text-sm sm:text-base focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select 
                value={type} 
                onChange={(e)=>setType(e.target.value)} 
                className="w-full pl-9 sm:pl-10 pr-8 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/10 text-white text-sm sm:text-base focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all appearance-none"
              >
                <option value="" className="bg-black text-white">All Types</option>
                <option value="full-time" className="bg-black text-white">Full-time</option>
                <option value="internship" className="bg-black text-white">Internship</option>
                <option value="part-time" className="bg-black text-white">Part-time</option>
                <option value="contract" className="bg-black text-white">Contract</option>
              </select>
              {/* Dropdown arrow icon */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button 
              onClick={() => { setQuery(""); setLocation(""); setType(""); }} 
              className="py-2 sm:py-2.5 px-3 sm:px-4 text-sm sm:text-base font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 transition w-full"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Job Listings - Improved responsive card layout */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <MiniLoader size="lg" color="blue" />
              <p className="text-gray-400 mt-2 text-sm sm:text-base">Loading jobs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              {/* Icon */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              
              {/* Text */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl font-medium text-white mb-1 sm:mb-2">
                  No jobs found
                </h3>
                
                <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                  {Array.isArray(jobs) && jobs.length > 0 
                    ? "No jobs match your current filters. Try adjusting your search criteria."
                    : "No jobs are currently available. Check back later for new opportunities."
                  }
                </p>
                
                {Array.isArray(jobs) && jobs.length > 0 && (query || location || type) && (
                  <div className="mt-3 sm:mt-4">
                    <button
                      onClick={() => { setQuery(""); setLocation(""); setType(""); }}
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
            filtered.map((job) => {
              const jobId = job._id || job.id;
              const isBookmarked = bookmarked.has(jobId);
              const isApplied = applied.has(jobId);
              return (
                <div 
                  key={jobId} 
                  className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-white">{job.title}</h3>
                          <p className="text-gray-300 text-sm">{job.company?.name || job.createdBy?.name || 'Company Name'}</p>
                        </div>
                      </div>
                      
                      {/* Responsive grid for job details */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300">{job.location || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300 capitalize">{job.jobType || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300 capitalize">{job.experienceLevel || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300">{job.salary ? `₹${job.salary.toLocaleString()}` : 'Not disclosed'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300">
                            {job.role || 'Role not specified'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Skills section with responsive wrapping */}
                      <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
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
                    
                    {/* Action buttons - stacked on mobile, horizontal on larger screens */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-3 ml-0 sm:ml-4">
                      <button 
                        onClick={() => toggleBookmark(job)}
                        className={`p-2 rounded-lg border ${
                          isBookmarked 
                            ? "border-yellow-400 text-yellow-300 bg-yellow-400/10" 
                            : "border-white/30 text-white bg-white/10"
                        }`}
                        title={isBookmarked ? "Remove bookmark" : "Bookmark job"}
                      >
                        <BookmarkIcon className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedJob(job);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap min-w-[80px] sm:min-w-[100px] justify-center"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="hidden xs:inline">View</span>
                        <span className="inline xs:hidden">View</span>
                      </button>
                      <button 
                        onClick={() => {
                          const jobId = job._id || job.id;
                          console.log('Apply button clicked for jobId:', jobId);
                          handleApply(jobId);
                        }}
                        disabled={isApplied || applying === jobId}
                        className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-full border transition flex items-center justify-center whitespace-nowrap min-w-[80px] sm:min-w-[100px] ${
                          isApplied
                            ? "bg-green-500/20 border-green-500/50 text-green-500 cursor-not-allowed font-bold"
                            : "bg-white/10 border-white/30 text-white hover:bg-green-500/20 hover:border-green-500/50"
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="hidden xs:inline">Applied</span>
                            <span className="inline xs:hidden">Applied</span>
                          </>
                        ) : applying === jobId ? (
                          <div className="w-4 h-4 flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <>
                            <span className="hidden xs:inline">Apply Now</span>
                            <span className="inline xs:hidden">Apply</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
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
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => toggleBookmark(selectedJob)}
                    className={`px-4 py-2.5 font-semibold rounded-lg transition w-full sm:w-auto ${
                      bookmarked.has(selectedJob._id || selectedJob.id)
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                        : "bg-white/10 text-white border border-white/30 hover:bg-white/20"
                    }`}
                  >
                    {bookmarked.has(selectedJob._id || selectedJob.id) ? "Bookmarked" : "Bookmark"}
                  </button>
                  <button
                    onClick={() => {
                      const jobId = selectedJob._id || selectedJob.id;
                      console.log('Apply button clicked for jobId:', jobId);
                      if (applied.has(jobId)) {
                        setErrorMsg('You have already applied to this job');
                        // Scroll to top to show error message
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        handleApply(jobId);
                      }
                    }}
                    disabled={applied.has(selectedJob._id || selectedJob.id) || applying === (selectedJob._id || selectedJob.id)}
                    className={`px-4 py-2.5 font-semibold rounded-lg border transition flex items-center justify-center w-full sm:w-auto ${
                      applied.has(selectedJob._id || selectedJob.id)
                        ? "bg-green-500/20 border-green-500/50 text-green-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-500 text-white"
                    }`}
                  >
                    {applied.has(selectedJob._id || selectedJob.id) ? (
                      <>
                        <Check className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>Applied</span>
                      </>
                    ) : applying === (selectedJob._id || selectedJob.id) ? (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      "Apply Now"
                    )}
                  </button>
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
                  <X className="w-6 h-6" />
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
                    onClick={() => {
                      const jobId = selectedJobForApply._id || selectedJobForApply.id;
                      console.log('Submit application clicked for jobId:', jobId);
                      submitApplication(jobId);
                    }}
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