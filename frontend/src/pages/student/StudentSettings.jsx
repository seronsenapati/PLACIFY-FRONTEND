// src/pages/student/StudentSettings.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import { cachedApiCall } from "../../utils/cache"; // Added import for caching utility
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";
import Message from "../../components/Message";

export default function StudentSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    profilePhoto: null,
    profilePhotoUrl: "", // preview / saved photo
  });

  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    email: {
      enabled: true,
      types: {
        application_status: true,
        new_application: true,
        job_expiring: true,
        job_expired: true,
        system_message: true,
        account_update: false,
        payment_update: true,
        reminder: true
      }
    },
    push: {
      enabled: true,
      types: {
        application_status: true,
        new_application: true,
        job_expiring: false,
        job_expired: false,
        system_message: true,
        account_update: false,
        payment_update: true,
        reminder: true
      }
    },
    inApp: {
      enabled: true,
      types: {
        application_status: true,
        new_application: true,
        job_expiring: true,
        job_expired: true,
        system_message: true,
        account_update: true,
        payment_update: true,
        reminder: true
      }
    },
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
      timezone: "UTC"
    }
  });
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [resettingNotifications, setResettingNotifications] = useState(false);

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

  // ✅ Fetch profile info and notification preferences on mount
  useEffect(() => {
    (async () => {
      try {
        // Fetch profile info
        const profileRes = await cachedApiCall(
          () => api.get("/settings/profile"),
          "/settings/profile"
        );
        const profileData = profileRes.data?.data || {};
        setForm({
          name: profileData.name || "",
          username: profileData.username || "",
          email: profileData.email || "",
          profilePhoto: null,
          profilePhotoUrl: profileData.profilePhoto || "", // use backend image if present
        });

        // Fetch notification preferences
        const notificationRes = await cachedApiCall(
          () => api.get("/settings/notifications"),
          "/settings/notifications"
        );
        const notificationData = notificationRes.data?.data || {};
        if (notificationData && Object.keys(notificationData).length > 0) {
          setNotificationPreferences(notificationData);
        }
      } catch (err) {
        console.error("[fetch settings]", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Save general info
  async function saveGeneral(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("email", form.email);
      
      // Only append profile photo if it's a new file
      if (form.profilePhoto instanceof File) {
        formData.append("profilePhoto", form.profilePhoto);
      }

      const response = await api.patch("/settings/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setSuccessMsg("Profile updated successfully!");
      
      // Update form state with the response data
      const data = response?.data?.data || {};
      setForm(prev => ({
        ...prev,
        name: data.name || prev.name,
        username: data.username || prev.username,
        email: data.email || prev.email,
        profilePhoto: null, // Clear the file object
        profilePhotoUrl: data.profilePhoto || prev.profilePhotoUrl
      }));
    } catch (err) {
      console.error("[save general]", err);
      const errorMessage = err.response?.data?.message || "Failed to update profile";
      setErrorMsg(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  // ✅ Change password
  async function changePassword(e) {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) {
      setErrorMsg("Passwords do not match. Please try again.");
      return;
    }
    if (pwd.newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(pwd.newPassword)) {
      setErrorMsg("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(pwd.newPassword)) {
      setErrorMsg("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/\d/.test(pwd.newPassword)) {
      setErrorMsg("Password must contain at least one number.");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd.newPassword)) {
      setErrorMsg("Password must contain at least one special character.");
      return;
    }
    
    setChanging(true);
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
      setChanging(false);
    }
  }

  // ✅ Save notification preferences
  async function saveNotificationPreferences(e) {
    e.preventDefault();
    setSavingNotifications(true);
    setErrorMsg("");
    try {
      await api.patch("/settings/notifications", notificationPreferences);
      setSuccessMsg("Notification preferences updated successfully!");
    } catch (err) {
      console.error("[save notifications]", err);
      const errorMessage = err.response?.data?.message || "Failed to update notification preferences";
      setErrorMsg(errorMessage);
    } finally {
      setSavingNotifications(false);
    }
  }

  // ✅ Reset notification preferences to default
  async function resetNotificationPreferences() {
    setResettingNotifications(true);
    setErrorMsg("");
    try {
      const res = await api.post("/settings/notifications/reset");
      const data = res.data?.data || {};
      if (data && Object.keys(data).length > 0) {
        setNotificationPreferences(data);
      }
      setSuccessMsg("Notification preferences reset to default!");
    } catch (err) {
      console.error("[reset notifications]", err);
      const errorMessage = err.response?.data?.message || "Failed to reset notification preferences";
      setErrorMsg(errorMessage);
    } finally {
      setResettingNotifications(false);
    }
  }

  // Helper function to update notification preferences
  const updateNotificationSetting = (channel, type, value) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type === 'enabled' ? 'enabled' : 'types']: 
          type === 'enabled' ? value : {
            ...prev[channel].types,
            [type]: value
          }
      }
    }));
  };

  // Helper function to update quiet hours
  const updateQuietHours = (field, value) => {
    setNotificationPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <LoadingScreen 
        title="Loading Settings"
        subtitle="Preparing your account settings..."
        steps={[
          { text: "Fetching profile data", color: "blue" },
          { text: "Loading preferences", color: "purple" },
          { text: "Preparing interface", color: "green" }
        ]}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start">
      <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-4 sm:mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Account Settings</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your account preferences and security</p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <Message 
            type="success" 
            message={successMsg} 
            onClose={() => setSuccessMsg("")} 
          />
        )}

        {/* Error Message */}
        {errorMsg && (
          <Message 
            type="error" 
            message={errorMsg} 
            onClose={() => setErrorMsg("")} 
          />
        )}
        {/* Enhanced Tabs - Made responsive for mobile */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 p-1 bg-white/5 rounded-lg border border-white/10 w-full">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-2 px-3 sm:py-3 sm:px-4 font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 flex-1 min-w-[80px] sm:min-w-[120px] justify-center text-xs sm:text-sm ${
              activeTab === "general"
                ? "bg-white/20 border border-white/30 text-white shadow-lg"
                : "bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden xs:inline">General</span>
            <span className="xs:hidden">Gen</span>
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`py-2 px-3 sm:py-3 sm:px-4 font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 flex-1 min-w-[80px] sm:min-w-[120px] justify-center text-xs sm:text-sm ${
              activeTab === "password"
                ? "bg-white/20 border border-white/30 text-white shadow-lg"
                : "bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="hidden xs:inline">Password</span>
            <span className="xs:hidden">Pass</span>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-2 px-3 sm:py-3 sm:px-4 font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 flex-1 min-w-[80px] sm:min-w-[120px] justify-center text-xs sm:text-sm ${
              activeTab === "notifications"
                ? "bg-white/20 border border-white/30 text-white shadow-lg"
                : "bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.07c.893.204 1.962.32 3.17.32h7.244c1.208 0 2.277-.116 3.17-.32a.75.75 0 00.515-1.07C16.454 11.665 16 9.887 16 8a6 6 0 00-6-6zM8 19a2 2 0 104 0v1a2 2 0 11-4 0v-1z" />
            </svg>
            <span className="hidden xs:inline">Notifications</span>
            <span className="xs:hidden">Notify</span>
          </button>
        </div>

        {/* Enhanced General Tab */}
        {activeTab === "general" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 sm:p-5">
            <form onSubmit={saveGeneral} className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-2">Profile Information</h2>
                  <p className="text-gray-400 text-sm sm:text-base">Update your account details and preferences</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-white/5 rounded-lg border border-white/10 px-3 py-2 sm:px-4 sm:py-3">
                    <div className="text-xs sm:text-sm text-gray-300 font-medium text-center">Account Status</div>
                    <div className="text-green-400 text-xs sm:text-sm flex items-center gap-1 mt-1 justify-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Profile Photo Section */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Profile Photo
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-lg">
                    {form.profilePhotoUrl ? (
                      <img
                        src={form.profilePhotoUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setForm({
                          ...form,
                          profilePhoto: file || null,
                          profilePhotoUrl: file
                            ? URL.createObjectURL(file)
                            : form.profilePhotoUrl,
                        });
                      }}
                      className="block w-full text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-2 sm:file:py-3 file:px-3 sm:file:px-6 file:rounded-full file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 file:font-semibold transition-all file:cursor-pointer"
                    />
                    <p className="text-xs text-gray-400 mt-1 sm:mt-2">Upload a professional photo. JPG, PNG or GIF (max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-neutral-800 border border-white/10 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Username *</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-neutral-800 border border-white/10 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Choose a unique username"
                    required
                  />
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-neutral-800 border border-white/10 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {/* Enhanced Save Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 font-semibold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white text-sm sm:text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {saving ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MiniLoader size="xs" color="white" />
                      <span className="text-sm sm:text-base">Saving Changes...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm sm:text-base">Save Changes</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Enhanced Password Tab */}
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
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase letter (A-Z)</li>
                    <li>• Contains lowercase letter (a-z)</li>
                    <li>• Contains number (0-9)</li>
                    <li>• Contains special character (!@#$%^&*()_+-=[]{};':"\|,.&lt;&gt;/?))</li>
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
                  disabled={changing || pwd.newPassword !== pwd.confirmPassword}
                  className="px-8 py-3 font-semibold rounded-full bg-gradient-to-r from-green-600 to-teal-600 border-0 text-white hover:from-green-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {changing ? (
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

        {/* Enhanced Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-5">
            <form onSubmit={saveNotificationPreferences} className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Notification Preferences</h2>
                  <p className="text-gray-400">Customize how and when you receive notifications</p>
                </div>
                <button
                  type="button"
                  onClick={resetNotificationPreferences}
                  disabled={resettingNotifications}
                  className="px-4 py-2 text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resettingNotifications ? (
                    <div className="flex items-center gap-2">
                      <MiniLoader size="xs" color="white" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    "Reset to Default"
                  )}
                </button>
              </div>

              {/* Email Notifications */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white">Email Notifications</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationPreferences.email.enabled}
                      onChange={(e) => updateNotificationSetting('email', 'enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {notificationPreferences.email.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-8">
                    {Object.entries(notificationPreferences.email.types).map(([type, enabled]) => (
                      <label key={type} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-sm text-gray-300 capitalize">
                          {type.replace('_', ' ')}
                        </span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          checked={enabled}
                          onChange={(e) => updateNotificationSetting('email', type, e.target.checked)}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Push Notifications */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white">Push Notifications</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationPreferences.push.enabled}
                      onChange={(e) => updateNotificationSetting('push', 'enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                {notificationPreferences.push.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-8">
                    {Object.entries(notificationPreferences.push.types).map(([type, enabled]) => (
                      <label key={type} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-sm text-gray-300 capitalize">
                          {type.replace('_', ' ')}
                        </span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                          checked={enabled}
                          onChange={(e) => updateNotificationSetting('push', type, e.target.checked)}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* In-App Notifications */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white">In-App Notifications</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationPreferences.inApp.enabled}
                      onChange={(e) => updateNotificationSetting('inApp', 'enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                {notificationPreferences.inApp.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-8">
                    {Object.entries(notificationPreferences.inApp.types).map(([type, enabled]) => (
                      <label key={type} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-sm text-gray-300 capitalize">
                          {type.replace('_', ' ')}
                        </span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                          checked={enabled}
                          onChange={(e) => updateNotificationSetting('inApp', type, e.target.checked)}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Quiet Hours */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Quiet Hours</h3>
                      <p className="text-xs text-gray-400">Disable notifications during specified hours</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationPreferences.quietHours.enabled}
                      onChange={(e) => updateQuietHours('enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>
                {notificationPreferences.quietHours.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={notificationPreferences.quietHours.start}
                        onChange={(e) => updateQuietHours('start', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                      <input
                        type="time"
                        value={notificationPreferences.quietHours.end}
                        onChange={(e) => updateQuietHours('end', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                      <select
                        value={notificationPreferences.quietHours.timezone}
                        onChange={(e) => updateQuietHours('timezone', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angleles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                        <option value="Asia/Shanghai">Shanghai</option>
                        <option value="Asia/Kolkata">India</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Save Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={savingNotifications}
                  className="px-8 py-3 font-semibold rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 border-0 text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {savingNotifications ? (
                    <div className="flex items-center gap-3">
                      <MiniLoader size="sm" color="white" />
                      <span>Saving Preferences...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Notification Preferences
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}