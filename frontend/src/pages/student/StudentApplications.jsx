// src/pages/student/StudentApplications.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";

function badgeClass(status) {
  const base = "px-3 py-1.5 rounded-full text-xs font-medium";
  if (status === "Accepted") return `${base} bg-green-500/10 text-green-300`;
  if (status === "Rejected") return `${base} bg-red-500/10 text-red-300`;
  if (status === "Interview") return `${base} bg-blue-500/10 text-blue-300`;
  return `${base} bg-yellow-500/10 text-yellow-300`;
}

export default function StudentApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  
  // Container style
  const containerStyle = {
    padding: '1.1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '0.5rem',
    minHeight: 'calc(100vh - 8rem)'
  };

  useEffect(()=>{ load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/applications/student");
      setApps(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function withdraw(app) {
    const id = app.id || app._id;
    setWithdrawing(id);
    try {
      await api.patch(`/applications/${id}`, { action: "withdraw" });
      // OR if your backend expects specific withdraw endpoint, doc lists /applications/:id PATCH for recruiter updates,
      // but earlier doc also had withdraw via /applications/:id/withdraw - if that is your route use:
      // await api.post(`/applications/${id}/withdraw`);
      // reflect change locally
      setApps(prev => prev.map(a => (a.id===id || a._id===id) ? { ...a, status: "Withdrawn" } : a));
    } catch (err) {
      console.error(err);
    } finally {
      setWithdrawing(null);
    }
  }

  return (
    <div style={containerStyle}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">My Applications</h1>
        {loading ? <div className="text-gray-400">Loading…</div> :
          apps.length===0 ? <div className="text-gray-400">No applications yet.</div> :
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-300">
                    <th className="py-2 pr-4">Job</th>
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2 pr-4">Applied</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map(a=>{
                    const id = a.id || a._id;
                    return (
                      <tr key={id} className="border-b border-white/5">
                        <td className="py-3 pr-4">{a.job?.title || a.title}</td>
                        <td className="py-3 pr-4 text-gray-300">{a.job?.company || a.company}</td>
                        <td className="py-3 pr-4 text-gray-400">{a.createdAt || a.appliedAt || a.appliedDate}</td>
                        <td className="py-3 pr-4"><span className={badgeClass(a.status)}>{a.status}</span></td>
                        <td className="py-3 pr-4 text-right">
                          <button onClick={()=>withdraw(a)} disabled={withdrawing===id} className="px-3 py-1.5 rounded-lg border border-white/20">
                            {withdrawing===id ? "Withdrawing…" : "Withdraw"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}
