// src/pages/student/StudentJobs.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [bookmarked, setBookmarked] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [applying, setApplying] = useState(null);
  
  // Add a container with proper padding and margin
  const containerStyle = {
    padding: '1.1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '0.5rem',
    minHeight: 'calc(100vh - 8rem)'
  };
  useEffect(() => {
    (async () => {
      try {
        const [jobsRes, bookmarksRes] = await Promise.all([
          api.get("/jobs"),
          api.get("/bookmarks"),
        ]);
        setJobs(jobsRes.data || []);
        const bSet = new Set((bookmarksRes.data || []).map((b)=>b.jobId || b._id || b.id));
        setBookmarked(bSet);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
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
      } else {
        await api.post(`/bookmarks/${id}`);
        setBookmarked(prev => new Set(prev).add(id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const applyToJob = async (job) => {
    const id = job.id || job._id;
    setApplying(id);
    try {
      // If backend requires resume upload, you can present a modal with file input; here we assume server uses stored resume or allows empty body
      await api.post(`/jobs/${id}/apply`);
      // optional: show notification/toast
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(null);
    }
  };

  return (
    <div style={containerStyle}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Available Jobs</h1>
          <div className="flex gap-2">
            <button onClick={() => { setQuery(""); setLocation(""); setType(""); }} className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition">Reset</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search title, company, skills..."
            className="px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white" />
          <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Location"
            className="px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white" />
          <select value={type} onChange={(e)=>setType(e.target.value)} className="px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white">
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="internship">Internship</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? <div className="text-gray-400">Loading...</div> :
          (filtered.length === 0 ? <div className="text-gray-400">No jobs found</div> :
            filtered.map((job) => {
              const id = job.id || job._id;
              const isBook = bookmarked.has(id);
              return (
                <div key={id} className="rounded-xl bg-white/5 border border-white/10 p-5 hover:border-white/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <p className="text-gray-300">{job.company}</p>
                    </div>
                    <button onClick={()=>toggleBookmark(job)} className={`py-2 px-4 rounded-full border text-xs font-semibold transition ${isBook ? "border-yellow-400 text-yellow-300 bg-yellow-400/10" : "border-white/30 text-white bg-white/10 hover:bg-white/20"}`}>
                      {isBook ? "Bookmarked" : "Bookmark"}
                    </button>
                  </div>
                  <div className="mt-3 text-sm text-gray-400">{job.location} • {job.jobType || job.type}</div>
                  {Array.isArray(job.skills) && job.skills.length>0 && (
                    <div className="mt-3 flex flex-wrap gap-2">{job.skills.map((s,i)=>(<span key={i} className="px-2 py-1 rounded-full bg-white/10 border border-white/10 text-xs">{s}</span>))}</div>
                  )}
                  <div className="mt-4 flex gap-3">
                    <button onClick={()=>applyToJob(job)} disabled={applying===id} className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition disabled:opacity-50">
                      {applying===id ? "Applying…" : "Apply"}
                    </button>
                  </div>
                </div>
              );
            })
          )
        }
      </div>
    </div>
  );
}
