// src/pages/recruiter/RecruiterNotifications.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";

export default function RecruiterNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    unread: null,
    type: '',
    priority: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [priorities, setPriorities] = useState([]);
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
    loadNotifications();
    loadStats();
    loadNotificationTypes();
  }, [filters]);

  async function loadNotifications() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.unread !== null) queryParams.append('unread', filters.unread);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.search) queryParams.append('search', filters.search);

      const res = await api.get(`/notifications?${queryParams.toString()}`);
      const data = res.data.data;
      setNotifications(data.notifications || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Error loading notifications:', err);
      setErrorMsg('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await api.get("/notifications/stats");
      setStats(res.data.data || {});
    } catch (err) {
      console.error('Error loading notification stats:', err);
    }
  }

  async function loadNotificationTypes() {
    try {
      const res = await api.get("/notifications/types");
      const data = res.data.data;
      setNotificationTypes(data.types || []);
      setPriorities(data.priorities || []);
    } catch (err) {
      console.error('Error loading notification types:', err);
    }
  }

  async function markAllAsRead() {
    setActionLoading(prev => ({ ...prev, markAll: true }));
    try {
      const res = await api.patch("/notifications/mark-read", {
        type: filters.type || undefined,
        priority: filters.priority || undefined
      });
      setSuccessMsg(`${res.data.data.modifiedCount} notifications marked as read`);
      loadNotifications();
      loadStats();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      setErrorMsg('Failed to mark notifications as read');
    } finally {
      setActionLoading(prev => ({ ...prev, markAll: false }));
    }
  }

  async function markSingleAsRead(notificationId) {
    setActionLoading(prev => ({ ...prev, [notificationId]: true }));
    try {
      await api.patch(`/notifications/${notificationId}/mark-read`);
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      loadStats();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setErrorMsg('Failed to mark notification as read');
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: false }));
    }
  }

  async function deleteNotifications(criteria = {}) {
    setActionLoading(prev => ({ ...prev, delete: true }));
    try {
      const res = await api.delete("/notifications", { data: criteria });
      setSuccessMsg(`${res.data.data.deletedCount} notifications deleted`);
      loadNotifications();
      loadStats();
    } catch (err) {
      console.error('Error deleting notifications:', err);
      setErrorMsg('Failed to delete notifications');
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_application':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'job_expiring':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'job_expired':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'system_message':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'account_update':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
          </svg>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatNotificationType = (type) => {
    switch (type) {
      case 'job_expiring':
        return 'Job Expiring';
      case 'job_expired':
        return 'Job Expired';
      case 'new_application':
        return 'New Application';
      case 'system_message':
        return 'System Message';
      case 'account_update':
        return 'Account Update';
      default:
        return type.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
  };

  const renderJobExpirationDetails = (notification) => {
    if (notification.type !== 'job_expiring' && notification.type !== 'job_expired') {
      return null;
    }

    const jobId = notification.metadata?.jobId;
    const daysLeft = notification.metadata?.daysLeft;
    
    return (
      <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-300 font-medium">
              {notification.type === 'job_expiring' 
                ? `This job expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` 
                : 'This job has expired'}
            </p>
          </div>
          {jobId && (
            <button
              onClick={() => {
                // Navigate to the job management page for this specific job
                window.location.href = `/recruiter/manage-jobs?jobId=${jobId}`;
              }}
              className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
            >
              View Job
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <LoadingScreen 
        title="Loading Notifications"
        subtitle="Fetching your latest updates..."
        steps={[
          { text: "Fetching notifications", color: "blue" },
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
          <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-400">Stay updated with your latest activity and important updates</p>
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

        {/* Statistics Cards */}
        {stats && Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.07c.893.204 1.962.32 3.17.32h7.244c1.208 0 2.277-.116 3.17-.32a.75.75 0 00.515-1.07C16.454 11.665 16 9.887 16 8a6 6 0 00-6-6zM8 19a2 2 0 104 0v1a2 2 0 11-4 0v-1z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Notifications</p>
                  <p className="text-xl font-semibold text-white">{stats.total || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Unread</p>
                  <p className="text-xl font-semibold text-white">{stats.unread || 0}</p>
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
                  <p className="text-sm text-gray-400">Expiring Jobs</p>
                  <p className="text-xl font-semibold text-white">
                    {stats.byType?.find(t => t._id === 'job_expiring')?.unread || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Expired Jobs</p>
                  <p className="text-xl font-semibold text-white">
                    {stats.byType?.find(t => t._id === 'job_expired')?.unread || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Read Status Filter */}
            <div>
              <select
                value={filters.unread || ''}
                onChange={(e) => handleFilterChange('unread', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Notifications</option>
                <option value="true">Unread Only</option>
                <option value="false">Read Only</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {notifications.some(n => !n.read) && (
              <button
                onClick={markAllAsRead}
                disabled={actionLoading.markAll}
                className="px-6 py-3 font-semibold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                {actionLoading.markAll ? (
                  <div className="flex items-center gap-2">
                    <MiniLoader size="sm" color="white" />
                    <span>Marking as Read...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark All as Read
                  </div>
                )}
              </button>
            )}
            
            <button
              onClick={() => deleteNotifications({ read: true })}
              disabled={actionLoading.delete}
              className="px-6 py-3 font-semibold rounded-full bg-gradient-to-r from-gray-600 to-gray-700 border-0 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {actionLoading.delete ? (
                <div className="flex items-center gap-2">
                  <MiniLoader size="sm" color="white" />
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Read
                </div>
              )}
            </button>

            <button
              onClick={() => deleteNotifications({})}
              disabled={actionLoading.delete}
              className="px-6 py-3 font-semibold rounded-full bg-gradient-to-r from-red-600 to-red-700 border-0 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {actionLoading.delete ? (
                <div className="flex items-center gap-2">
                  <MiniLoader size="sm" color="white" />
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete All
                </div>
              )}
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <MiniLoader size="lg" color="blue" />
              <p className="text-gray-400 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              {/* Simple Icon */}
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.07c.893.204 1.962.32 3.17.32h7.244c1.208 0 2.277-.116 3.17-.32a.75.75 0 00.515-1.07C16.454 11.665 16 9.887 16 8a6 6 0 00-6-6zM8 19a2 2 0 104 0v1a2 2 0 11-4 0v-1z" />
                </svg>
              </div>
              
              {/* Static Text */}
              <div className="space-y-3">
                <h3 className="text-xl font-medium text-white mb-2">
                  No notifications found
                </h3>
                
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                  {filters.search || filters.type || filters.priority || filters.unread !== null 
                    ? "No notifications match your current filters. Try adjusting your search criteria."
                    : "You're all caught up! Check back later for new updates."
                  }
                </p>
                
                {/* Clear Filters Button */}
                {(filters.search || filters.type || filters.priority || filters.unread !== null) && (
                  <div className="mt-4">
                    <button
                      onClick={() => setFilters({
                        page: 1,
                        limit: 20,
                        unread: null,
                        type: '',
                        priority: '',
                        search: ''
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
            notifications.map(notification => {
              const isUnread = !notification.read;
              const priorityColor = getPriorityColor(notification.priority);
              
              return (
                <div 
                  key={notification._id} 
                  className={`p-5 rounded-xl border transition-all duration-300 ${
                    isUnread 
                      ? 'bg-blue-500/10 border-blue-500/20 shadow-lg'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${isUnread ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isUnread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                            <h3 className="font-semibold text-white text-base">
                              {notification.title}
                            </h3>
                          </div>
                          
                          <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          {/* Job expiration details for job-related notifications */}
                          {renderJobExpirationDetails(notification)}
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className={`px-2 py-1 rounded-full border ${priorityColor}`}>
                              {notification.priority?.charAt(0).toUpperCase() + notification.priority?.slice(1)}
                            </span>
                            
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                              {formatNotificationType(notification.type)}
                            </span>
                            
                            <span className="text-gray-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            
                            {notification.expiresAt && (
                              <span className="text-yellow-400">
                                Expires: {new Date(notification.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <button
                              onClick={() => markSingleAsRead(notification._id)}
                              disabled={actionLoading[notification._id]}
                              className="px-3 py-1 text-xs font-medium text-blue-400 border border-blue-500/30 rounded-full hover:bg-blue-500/20 transition-all disabled:opacity-50"
                            >
                              {actionLoading[notification._id] ? (
                                <MiniLoader size="xs" color="blue" />
                              ) : (
                                'Mark Read'
                              )}
                            </button>
                          )}
                          
                          <span className={`text-xs font-medium ${
                            isUnread ? 'text-blue-400' : 'text-green-400'
                          }`}>
                            {isUnread ? 'Unread' : 'Read'}
                          </span>
                        </div>
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
              Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of {pagination.totalCount} notifications
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
      </div>
    </div>
  );
}