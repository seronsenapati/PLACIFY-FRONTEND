// src/pages/student/StudentNotifications.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function StudentNotifications() {
  // Container style
 const containerStyle = {
    padding: '1.1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '0.5rem',
    minHeight: 'calc(100vh - 8rem)'
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  useEffect(()=>{ load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id) {
    setBusy(id);
    try {
      await api.patch("/notifications/mark-read", { id }); // per doc mark-read PATCH
      setItems(prev => prev.map(n => (n.id===id || n._id===id) ? {...n, read:true} : n));
    } catch (err) {
      console.error(err);
    } finally { setBusy(null); }
  }

  async function remove(id) {
    setBusy(id);
    try {
      await api.delete("/notifications", { data: { id } }); // doc shows DELETE /api/notifications/ (likely body)
      setItems(prev => prev.filter(n => !(n.id===id || n._id===id)));
    } catch (err) {
      console.error(err);
    } finally { setBusy(null); }
  }

  if (loading) {
    return <div style={containerStyle} className="text-gray-300">Loading notifications…</div>;
  }

  return (
    <div style={containerStyle}>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No notifications to display.
          </div>
        ) : (
          items.map(n => {
            const id = n.id || n._id;
            const isBusy = busy === id;
            
            return (
              <div 
                key={id} 
                className={`p-4 rounded-lg border ${
                  n.read 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-blue-500/10 border-blue-500/20'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">
                      {n.title || n.heading || 'Notification'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-300">
                      {n.message || n.body || n.text}
                    </p>
                    {n.createdAt && (
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {!n.read && (
                      <button
                        onClick={() => markRead(id)}
                        disabled={isBusy}
                        className="px-3 py-1.5 text-sm rounded-lg border border-white/20 hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => remove(id)}
                      disabled={isBusy}
                      className="px-3 py-1.5 text-sm rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {isBusy ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
