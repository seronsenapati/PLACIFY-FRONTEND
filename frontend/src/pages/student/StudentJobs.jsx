// src/pages/student/StudentJobs.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";
import { Search, MapPin, Building, Briefcase } from "lucide-react";

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [bookmarked, setBookmarked] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [applying, setApplying] = useState(null);
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
    (async () => {
      try {
        const [jobsRes, bookmarksRes] = await Promise.all([
          api.get("/jobs"),
          api.get("/bookmarks"),
        ]);
        
        // Ensure jobs data is an array
        const jobsData = Array.isArray(jobsRes.data) 
          ? jobsRes.data 
          : (jobsRes.data?.jobs || []);
        setJobs(jobsData);
        
        // Ensure bookmarks data is an array
        const bookmarksData = Array.isArray(bookmarksRes.data) 
          ? bookmarksRes.data 
          : (bookmarksRes.data?.data || []);
        const bSet = new Set(bookmarksData.map((b) => b.jobId || b._id || b.id));
        setBookmarked(bSet);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load jobs");
        setJobs([]); // Set to empty array on error
        setBookmarked(new Set()); // Reset bookmarks on error
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
      const okQ = !q || (j.title && j.title.toLowerCase().includes(q)) || (j.company && j.company.toLowerCase().includes(q));
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

  const applyToJob = async (job) => {
    const id = job.id || job._id;
    setApplying(id);
    try {
      // If backend requires resume upload, you can present a modal with file input; here we assume server uses stored resume or allows empty body
      await api.post(`/jobs/${id}/apply`);
      setSuccessMsg("Application submitted successfully");
      // optional: show notification/toast
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to apply for job");
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
        {/* Header - Matching style of other profile/settings pages */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Available Jobs</h1>
          <p className="text-gray-400">Browse and apply to job opportunities</p>
        </div>

        {/* Messages */}
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

        {/* Filters */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                value={query} 
                onChange={(e)=>setQuery(e.target.value)} 
                placeholder="Search title, company, skills..."
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-transparent border border-white/10 text-white focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                value={location} 
                onChange={(e)=>setLocation(e.target.value)} 
                placeholder="Location"
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-transparent border border-white/10 text-white focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <Briefcase className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select 
                value={type} 
                onChange={(e)=>setType(e.target.value)} 
                className="w-full pl-10 pr-8 py-2 rounded-lg bg-white/10 border border-white/10 text-white focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all appearance-none"
              >
                <option value="" className="bg-black text-white">All Types</option>
                <option value="full-time" className="bg-black text-white">Full-time</option>
                <option value="internship" className="bg-black text-white">Internship</option>
                <option value="part-time" className="bg-black text-white">Part-time</option>
                <option value="contract" className="bg-black text-white">Contract</option>
              </select>
              {/* Dropdown arrow icon */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button 
              onClick={() => { setQuery(""); setLocation(""); setType(""); }} 
              className="py-2.5 px-4 font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <MiniLoader size="lg" color="blue" />
              <p className="text-gray-400 mt-2">Loading jobs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              {/* Icon */}
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              
              {/* Text */}
              <div className="space-y-3">
                <h3 className="text-xl font-medium text-white mb-2">
                  No jobs found
                </h3>
                
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                  {Array.isArray(jobs) && jobs.length > 0 
                    ? "No jobs match your current filters. Try adjusting your search criteria."
                    : "No jobs are currently available. Check back later for new opportunities."
                  }
                </p>
                
                {Array.isArray(jobs) && jobs.length > 0 && (query || location || type) && (
                  <div className="mt-4">
                    <button
                      onClick={() => { setQuery(""); setLocation(""); setType(""); }}
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
            filtered.map((job) => {
              const id = job.id || job._id;
              const isBook = bookmarked.has(id);
              return (
                <div key={id} className="p-5 rounded-xl border transition-all duration-300 bg-white/5 border-white/10 hover:border-white/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mr-4">
                          <Briefcase className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center mt-1 text-sm">
                            <span className="flex items-center text-blue-300 mr-4">
                              <Building className="w-4 h-4 mr-1" />
                              {job.company}
                            </span>
                            <span className="flex items-center text-gray-400">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </span>
                          </div>
                          {job.desc && (
                            <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                              {job.desc}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Array.isArray(job.skills) && job.skills.slice(0, 3).map((s,i)=>(
                              <span key={i} className="px-2 py-1 rounded-full bg-white/10 border border-white/10 text-xs">
                                {s}
                              </span>
                            ))}
                            {Array.isArray(job.skills) && job.skills.length > 3 && (
                              <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10 text-xs">
                                +{job.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 ml-4">
                      <button 
                        onClick={()=>toggleBookmark(job)} 
                        className={`py-2 px-4 rounded-lg border text-xs font-semibold transition ${isBook ? "border-yellow-400 text-yellow-300 bg-yellow-400/10" : "border-white/30 text-white bg-white/10 hover:bg-white/20"}`}
                      >
                        {isBook ? "Saved" : "Save Job"}
                      </button>
                      <button 
                        onClick={()=>applyToJob(job)} 
                        disabled={applying===id} 
                        className="py-2.5 px-4 font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 transition disabled:opacity-50"
                      >
                        {applying===id ? (
                          <div className="flex items-center gap-2">
                            <MiniLoader size="xs" color="white" />
                            <span>Applying…</span>
                          </div>
                        ) : "Apply"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-400">
                    <span className="capitalize">{job.jobType || job.type}</span>
                    {job.salary && (
                      <>
                        <span className="mx-2">•</span>
                        <span>₹{job.salary.toLocaleString()} per year</span>
                      </>
                    )}
                    {job.expiresAt && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Expires: {new Date(job.expiresAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}