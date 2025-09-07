// src/pages/recruiter/RecruiterSettings.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";
import { getRole } from "../../utils/auth";

export default function RecruiterSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Add password state
  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Verify user is recruiter
  const role = getRole();
  if (role !== 'recruiter') {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex justify-center items-center">
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-white">Access Denied</h2>
          </div>
          <p className="text-gray-300 mb-4">
            This page is only accessible to recruiters. Your current role is: <span className="font-bold">{role || 'unknown'}</span>
          </p>
          <div className="text-sm text-gray-400">
            <p className="mb-2">If you believe this is an error:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Try logging out and logging back in</li>
              <li>Contact an administrator to verify your account role</li>
            </ol>
          </div>
          <div className="mt-6">
            <a 
              href="/recruiter/dashboard" 
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const [recruiterSettings, setRecruiterSettings] = useState({
    // Job creation defaults
    defaultJobExpirationDays: 30,
    defaultApplicationDeadlineDays: 14,
    
    // Notification preferences for job expiration
    notifyBeforeJobExpiration: true,
    jobExpirationNotificationDays: 3,
    
    // Application review settings
    autoReviewApplications: false,
    applicationReviewThreshold: 10,
    
    // Dashboard preferences
    dashboardMetrics: [
      'totalJobs',
      'activeJobs',
      'expiredJobs',
      'totalApplications',
      'pendingApplications',
      'reviewedApplications',
      'rejectedApplications'
    ],
    
    // Export preferences
    defaultExportFormat: 'csv'
  });
  const [resettingSettings, setResettingSettings] = useState(false);

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

  // ✅ Fetch recruiter settings on mount
  useEffect(() => {
    (async () => {
      try {
        // Check if user is recruiter
        const role = getRole();
        console.log("[RecruiterSettings] User role:", role);
        
        if (role !== 'recruiter') {
          setErrorMsg("Access denied. Recruiter access required. Your role is: " + role);
          setLoading(false);
          return;
        }
        
        // Check if token exists
        const token = localStorage.getItem('token');
        console.log("[RecruiterSettings] Auth token exists:", !!token);
        
        const res = await api.get("/settings/recruiter");
        const settingsData = res.data?.data || {};
        if (settingsData && Object.keys(settingsData).length > 0) {
          setRecruiterSettings(settingsData);
        }
      } catch (err) {
        console.error("[fetch recruiter settings]", err);
        
        // Handle specific error cases
        if (err.response?.status === 403) {
          setErrorMsg("Access denied. Please ensure you are logged in as a recruiter. If you believe this is an error, try logging out and logging back in.");
        } else if (err.response?.status === 401) {
          setErrorMsg("Authentication required. Please log in again.");
        } else {
          const errorMessage = err.response?.data?.message || "Failed to load recruiter settings";
          setErrorMsg(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Save recruiter settings
  async function saveRecruiterSettings(e) {
    e.preventDefault();
    
    // Validate settings before saving
    if (recruiterSettings.defaultJobExpirationDays < 1 || recruiterSettings.defaultJobExpirationDays > 365) {
      setErrorMsg("Job expiration days must be between 1 and 365");
      return;
    }
    
    if (recruiterSettings.defaultApplicationDeadlineDays < 1 || recruiterSettings.defaultApplicationDeadlineDays > 365) {
      setErrorMsg("Application deadline days must be between 1 and 365");
      return;
    }
    
    if (recruiterSettings.jobExpirationNotificationDays < 1 || recruiterSettings.jobExpirationNotificationDays > 30) {
      setErrorMsg("Job expiration notification days must be between 1 and 30");
      return;
    }
    
    if (recruiterSettings.applicationReviewThreshold < 1 || recruiterSettings.applicationReviewThreshold > 100) {
      setErrorMsg("Application review threshold must be between 1 and 100");
      return;
    }
    
    setSaving(true);
    setErrorMsg("");
    try {
      // Check if user is recruiter
      const role = getRole();
      if (role !== 'recruiter') {
        throw new Error("Access denied. Recruiter access required.");
      }
      
      await api.patch("/settings/recruiter", recruiterSettings);
      setSuccessMsg("Recruiter settings updated successfully!");
    } catch (err) {
      console.error("[save recruiter settings]", err);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setErrorMsg("Access denied. Please ensure you are logged in as a recruiter.");
      } else if (err.response?.status === 401) {
        setErrorMsg("Authentication required. Please log in again.");
      } else {
        const errorMessage = err.response?.data?.message || err.message || "Failed to update recruiter settings";
        setErrorMsg(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  }

  // ✅ Reset recruiter settings to default
  async function resetRecruiterSettings() {
    setResettingSettings(true);
    setErrorMsg("");
    try {
      // Check if user is recruiter
      const role = getRole();
      if (role !== 'recruiter') {
        throw new Error("Access denied. Recruiter access required.");
      }
      
      const res = await api.post("/settings/recruiter/reset");
      const data = res.data?.data || {};
      if (data && Object.keys(data).length > 0) {
        setRecruiterSettings(data);
      }
      setSuccessMsg("Recruiter settings reset to default!");
    } catch (err) {
      console.error("[reset recruiter settings]", err);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setErrorMsg("Access denied. Please ensure you are logged in as a recruiter.");
      } else if (err.response?.status === 401) {
        setErrorMsg("Authentication required. Please log in again.");
      } else {
        const errorMessage = err.response?.data?.message || err.message || "Failed to reset recruiter settings";
        setErrorMsg(errorMessage);
      }
    } finally {
      setResettingSettings(false);
    }
  }

  // Add change password function
  async function changePassword(e) {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) {
      setErrorMsg("Passwords do not match. Please try again.");
      return;
    }
    if (pwd.newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    
    setChangingPassword(true);
    setErrorMsg("");
    try {
      await api.patch("/settings/password", {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
        confirmNewPassword: pwd.confirmPassword,
      });
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccessMsg("Password updated successfully!");
    } catch (err) {
      console.error("[change password]", err);
      const errorMessage = err.response?.data?.message || "Failed to update password";
      setErrorMsg(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  }

  // Helper function to update settings
  const updateSetting = (field, value) => {
    setRecruiterSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to update dashboard metrics
  const toggleDashboardMetric = (metric) => {
    setRecruiterSettings(prev => {
      const metrics = [...prev.dashboardMetrics];
      const index = metrics.indexOf(metric);
      
      if (index > -1) {
        // Remove metric
        metrics.splice(index, 1);
      } else {
        // Add metric
        metrics.push(metric);
      }
      
      return {
        ...prev,
        dashboardMetrics: metrics
      };
    });
  };

  if (loading) {
    return (
      <LoadingScreen 
        title="Loading Recruiter Settings"
        subtitle="Preparing your account settings..."
        steps={[
          { text: "Verifying recruiter access", color: "blue" },
          { text: "Fetching recruiter data", color: "purple" },
          { text: "Loading preferences", color: "green" },
          { text: "Preparing interface", color: "yellow" }
        ]}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start">
      <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-white mb-2">Recruiter Settings</h1>
          <p className="text-gray-400">Manage your recruitment preferences and account settings</p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-500/20 text-green-300 text-sm rounded-lg border border-green-500/30 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="flex-1">{successMsg}</span>
            <button
              onClick={() => setSuccessMsg("")}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
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
            {errorMsg.includes("Access denied") && (
              <div className="text-xs mt-2">
                <p>If you believe this is an error:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Try logging out and logging back in</li>
                  <li>Ensure you are accessing this page from the recruiter dashboard</li>
                </ol>
              </div>
            )}
            <button
              onClick={() => setErrorMsg("")}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Enhanced Tabs - Add Password tab */}
        <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-lg border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-3 px-6 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "general"
                ? "bg-white/20 border border-white/30 text-white shadow-lg"
                : "bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            General
          </button>
          <button
            onClick={() => setActiveTab("jobDefaults")}
            className={`py-3 px-6 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "jobDefaults"
                ? "bg-white/20 border border-white/30 text-white shadow-lg"
                : "bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Job Defaults
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-3 px-6 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "notifications"
                ? "bg-white/20 border border-white/30 text-white shadow-lg"
                : "bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-3 px-6 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "dashboard"
                ? "bg-white/20 border border-white/30 text-white shadow-lg"
                : "bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard
          </button>
          {/* Add Password tab */}
          <button
            onClick={() => setActiveTab("password")}
            className={`py-3 px-6 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "password"
                ? "bg-white/20 border border-white/30 text-white shadow-lg"
                : "bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Password
          </button>
        </div>

        <form onSubmit={saveRecruiterSettings} className="space-y-8">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">General Settings</h2>
                  <p className="text-gray-400">Configure your general recruitment preferences</p>
                </div>
                <button
                  type="button"
                  onClick={resetRecruiterSettings}
                  disabled={resettingSettings}
                  className="px-4 py-2 text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resettingSettings ? (
                    <div className="flex items-center gap-2">
                      <MiniLoader size="xs" color="white" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    "Reset to Default"
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* Application Review Settings */}
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Application Review
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div>
                        <h4 className="font-medium text-white">Auto Review Applications</h4>
                        <p className="text-sm text-gray-400 mt-1">Automatically review applications based on your criteria</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={recruiterSettings.autoReviewApplications}
                          onChange={(e) => updateSetting('autoReviewApplications', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {recruiterSettings.autoReviewApplications && (
                      <div className="ml-8 p-4 rounded-lg bg-white/5 border border-white/10">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Review Threshold
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={recruiterSettings.applicationReviewThreshold}
                            onChange={(e) => updateSetting('applicationReviewThreshold', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-white font-medium w-12 text-center">
                            {recruiterSettings.applicationReviewThreshold}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Applications with match scores above this threshold will be automatically reviewed
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Export Settings */}
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Preferences
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Default Export Format
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => updateSetting('defaultExportFormat', 'csv')}
                          className={`p-4 rounded-lg border transition-all ${
                            recruiterSettings.defaultExportFormat === 'csv'
                              ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                              : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-medium">CSV</div>
                          <div className="text-xs mt-1">Comma-separated values</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSetting('defaultExportFormat', 'json')}
                          className={`p-4 rounded-lg border transition-all ${
                            recruiterSettings.defaultExportFormat === 'json'
                              ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                              : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-medium">JSON</div>
                          <div className="text-xs mt-1">JavaScript Object Notation</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job Defaults Tab */}
          {activeTab === "jobDefaults" && (
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Job Default Settings</h2>
                  <p className="text-gray-400">Set default values for new job postings</p>
                </div>
                <button
                  type="button"
                  onClick={resetRecruiterSettings}
                  disabled={resettingSettings}
                  className="px-4 py-2 text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resettingSettings ? (
                    <div className="flex items-center gap-2">
                      <MiniLoader size="xs" color="white" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    "Reset to Default"
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* Job Expiration */}
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Job Expiration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Default Job Expiration (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={recruiterSettings.defaultJobExpirationDays}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 30;
                          if (value >= 1 && value <= 365) {
                            updateSetting('defaultJobExpirationDays', value);
                          }
                        }}
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-400 mt-1">Default number of days before a job posting expires</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Default Application Deadline (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={recruiterSettings.defaultApplicationDeadlineDays}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 14;
                          if (value >= 1 && value <= 365) {
                            updateSetting('defaultApplicationDeadlineDays', value);
                          }
                        }}
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-400 mt-1">Default number of days for application deadline</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Notification Settings</h2>
                  <p className="text-gray-400">Configure when and how you receive job-related notifications</p>
                </div>
                <button
                  type="button"
                  onClick={resetRecruiterSettings}
                  disabled={resettingSettings}
                  className="px-4 py-2 text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resettingSettings ? (
                    <div className="flex items-center gap-2">
                      <MiniLoader size="xs" color="white" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    "Reset to Default"
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* Job Expiration Notifications */}
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Job Expiration
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">Notify Before Job Expiration</h4>
                        <p className="text-sm text-gray-400 mt-1">Receive notifications before jobs expire</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={recruiterSettings.notifyBeforeJobExpiration}
                          onChange={(e) => updateSetting('notifyBeforeJobExpiration', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {recruiterSettings.notifyBeforeJobExpiration && (
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Notification Days Before Expiration
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={recruiterSettings.jobExpirationNotificationDays}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 3;
                            if (value >= 1 && value <= 30) {
                              updateSetting('jobExpirationNotificationDays', value);
                            }
                          }}
                          className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Number of days before expiration to send notification
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Dashboard Metrics</h2>
                  <p className="text-gray-400">Select which metrics to display on your dashboard</p>
                </div>
                <button
                  type="button"
                  onClick={resetRecruiterSettings}
                  disabled={resettingSettings}
                  className="px-4 py-2 text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resettingSettings ? (
                    <div className="flex items-center gap-2">
                      <MiniLoader size="xs" color="white" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    "Reset to Default"
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* Dashboard Metrics Selection */}
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Metrics Display
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'totalJobs', label: 'Total Jobs Posted' },
                      { id: 'activeJobs', label: 'Active Jobs' },
                      { id: 'expiredJobs', label: 'Expired Jobs' },
                      { id: 'totalApplications', label: 'Total Applications' },
                      { id: 'pendingApplications', label: 'Pending Applications' },
                      { id: 'reviewedApplications', label: 'Reviewed Applications' },
                      { id: 'rejectedApplications', label: 'Rejected Applications' }
                    ].map((metric) => (
                      <label 
                        key={metric.id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <span className="text-gray-300">{metric.label}</span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          checked={recruiterSettings.dashboardMetrics.includes(metric.id)}
                          onChange={() => toggleDashboardMetric(metric.id)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Password Tab */}
          {activeTab === "password" && (
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <form onSubmit={changePassword} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Change Password</h2>
                  <p className="text-gray-400">Keep your account secure with a strong password</p>
                </div>

                {/* Security Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-300 font-medium text-sm">Password Requirements</p>
                    <ul className="text-blue-200 text-xs mt-1 space-y-1">
                      <li>• At least 6 characters long</li>
                      <li>• Use a combination of letters and numbers</li>
                      <li>• Avoid using personal information</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      value={pwd.currentPassword}
                      onChange={(e) => {
                        setPwd({ ...pwd, currentPassword: e.target.value });
                        setErrorMsg(""); // Clear errors on input
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your current password"
                      required
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={pwd.newPassword}
                      onChange={(e) => {
                        setPwd({ ...pwd, newPassword: e.target.value });
                        setErrorMsg(""); // Clear errors on input
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your new password"
                      minLength="6"
                      required
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={pwd.confirmPassword}
                      onChange={(e) => {
                        setPwd({ ...pwd, confirmPassword: e.target.value });
                        setErrorMsg(""); // Clear errors on input
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Confirm your new password"
                      required
                    />
                    {pwd.newPassword && pwd.confirmPassword && pwd.newPassword !== pwd.confirmPassword && (
                      <p className="text-red-400 text-xs mt-2">Passwords do not match</p>
                    )}
                    {pwd.newPassword && pwd.confirmPassword && pwd.newPassword === pwd.confirmPassword && (
                      <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Passwords match
                      </p>
                    )}
                  </div>
                </div>

                {/* Enhanced Update Button */}
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={changingPassword || pwd.newPassword !== pwd.confirmPassword}
                    className="px-8 py-3 font-semibold rounded-full bg-gradient-to-r from-green-600 to-teal-600 border-0 text-white hover:from-green-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {changingPassword ? (
                      <div className="flex items-center gap-3">
                        <MiniLoader size="sm" color="white" />
                        <span>Updating Password...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Update Password
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Enhanced Save Button - Only show for non-password tabs */}
          {activeTab !== "password" && (
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 font-semibold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {saving ? (
                  <div className="flex items-center gap-3">
                    <MiniLoader size="sm" color="white" />
                    <span>Saving Settings...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Settings
                  </div>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}