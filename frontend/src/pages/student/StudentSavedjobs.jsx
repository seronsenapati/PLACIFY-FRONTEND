// src/pages/student/StudentSavedJobs.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";
import { Bookmark, Trash2, Briefcase, MapPin, Building, Search } from "lucide-react";

export default function StudentSavedJobs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/bookmarks");
      // Ensure we're working with an array
      const savedJobsData = Array.isArray(res.data) ? res.data : [];
      setItems(savedJobsData);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load saved jobs");
      setItems([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }

  async function remove(jobId) {
    setActionLoading(prev => ({ ...prev, [jobId]: true }));
    try {
      await api.delete(`/bookmarks/${jobId}`);
      setItems((prev) =>
        Array.isArray(prev) ? prev.filter((x) => (x.jobId || x._id || x.id) !== jobId) : []
      );
      setSuccessMsg("Job removed from saved jobs");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to remove job from saved jobs");
    } finally {
      setActionLoading(prev => ({ ...prev, [jobId]: false }));
    }
  }

  // Filter items based on search term - ensure items is an array
  const filteredItems = Array.isArray(items) ? items.filter(item => {
    const job = item.job || item;
    const title = job.title?.toLowerCase() || "";
    const company = job.company?.toLowerCase() || "";
    const location = job.location?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    
    return title.includes(search) || company.includes(search) || location.includes(search);
  }) : [];

  // Ensure items is an array for statistics
  const validItems = Array.isArray(items) ? items : [];

  if (loading && validItems.length === 0) {
    return (
      <LoadingScreen 
        title="Loading Saved Jobs"
        subtitle="Fetching your saved job opportunities..."
        steps={[
          { text: "Retrieving saved jobs", color: "blue" },
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
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Saved Jobs</h1>
            {/* Total Saved Jobs Count - Card style with bookmark icon */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <Bookmark className="w-5 h-5 text-blue-400 mr-2" />
              <div>
                <p className="text-xs text-gray-400">Saved Jobs</p>
                <p className="text-lg font-semibold text-white">{validItems.length}</p>
              </div>
            </div>
          </div>
          <p className="text-gray-400">Manage your saved job opportunities</p>
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

        {/* Search */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-4 mb-6">
          <div className="flex items-center">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search your saved jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Saved Jobs list */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <MiniLoader size="lg" color="blue" />
              <p className="text-gray-400 mt-2">Loading saved jobs...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              {/* Icon */}
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Bookmark className="w-8 h-8 text-gray-400" />
                {validItems.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Text */}
              <div className="space-y-3">
                <h3 className="text-xl font-medium text-white mb-2">
                  {validItems.length > 0 ? "No matching saved jobs" : "No saved jobs yet"}
                </h3>
                
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                  {validItems.length > 0 
                    ? "No saved jobs match your search. Try different keywords."
                    : "Save jobs to keep track of opportunities you're interested in. They'll appear here for easy access."
                  }
                </p>
                
                {validItems.length > 0 && searchTerm && (
                  <div className="mt-4">
                    <button
                      onClick={() => setSearchTerm("")}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            filteredItems.map((item) => {
              const job = item.job || item;
              const jobId = job.id || job._id;
              
              return (
                <div 
                  key={jobId} 
                  className="p-5 rounded-xl border transition-all duration-300 bg-white/5 border-white/10 hover:border-white/20"
                >
                  <div className="flex justify-between items-start">
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
                          {job.description && (
                            <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                              {job.description}
                            </p>
                          )}
                          {job.savedAt && (
                            <p className="mt-2 text-xs text-gray-500">
                              Saved on {new Date(job.savedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => remove(jobId)}
                      disabled={actionLoading[jobId]}
                      className="ml-4 flex-shrink-0 py-2 px-3 font-semibold rounded-lg bg-white/10 border border-white/30 text-white hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-all duration-300 disabled:opacity-50"
                    >
                      {actionLoading[jobId] ? (
                        <MiniLoader size="sm" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
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