// src/pages/student/StudentSavedJobs.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function StudentSavedJobs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/bookmarks");
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function remove(jobId) {
    setRemoving(jobId);
    try {
      await api.delete(`/bookmarks/${jobId}`);
      setItems((prev) =>
        prev.filter((x) => (x.jobId || x._id || x.id) !== jobId)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(null);
    }
  }

  // Container style
  const containerStyle = {
    padding: '1.1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '0.5rem',
    minHeight: 'calc(100vh - 8rem)'
  };

  if (loading) {
    return <div style={containerStyle} className="text-gray-300">Loading saved jobs...</div>;
  }

  return (
    <div style={containerStyle}>
      <h1 className="text-2xl font-bold mb-6">Saved Jobs</h1>
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">You haven't saved any jobs yet.</p>
          <p className="text-sm text-gray-500 mt-2">Save jobs to view them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const job = item.job || item;
            const jobId = job.id || job._id;
            
            return (
              <div key={jobId} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <p className="text-blue-300">{job.company}</p>
                    <p className="text-sm text-gray-400 mt-1">{job.location}</p>
                  </div>
                  <button
                    onClick={() => remove(jobId)}
                    disabled={removing === jobId}
                    className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-red-500/20 hover:border-red-500/50 transition disabled:opacity-50"
                  >
                    {removing === jobId ? 'Removing...' : 'Remove'}
                  </button>
                </div>
                {job.description && (
                  <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                    {job.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
