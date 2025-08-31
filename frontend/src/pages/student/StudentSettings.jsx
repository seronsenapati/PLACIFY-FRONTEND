// src/pages/student/StudentSettings.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";

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

  // ✅ Fetch profile info on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/settings/profile");
        const data = res.data?.data || {};
        setForm({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          profilePhoto: null,
          profilePhotoUrl: data.profilePhoto || "", // use backend image if present
        });
      } catch (err) {
        console.error("[fetch profile]", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Save general info
  async function saveGeneral(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("email", form.email);
      if (form.profilePhoto) {
        formData.append("profilePhoto", form.profilePhoto);
      }

      await api.patch("/settings/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
        setSuccessMsg("Profile updated successfully!");
        
        // Update profile photo URL if a new photo was uploaded
        if (form.profilePhoto) {
          const res = await api.get("/settings/profile");
          const data = res.data?.data || {};
          setForm(prev => ({
            ...prev,
            profilePhoto: null,
            profilePhotoUrl: data.profilePhoto || prev.profilePhotoUrl
          }));
        }
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
    if (pwd.newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
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
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your account preferences and security</p>
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
        {/* Enhanced Tabs */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            General
          </button>
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

        {/* Enhanced General Tab */}
        {activeTab === "general" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-5">
            <form onSubmit={saveGeneral} className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Profile Information</h2>
                  <p className="text-gray-400">Update your account details and preferences</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-300 font-medium">Account Status</div>
                  <div className="text-green-400 text-sm flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Active
                  </div>
                </div>
              </div>

              {/* Enhanced Profile Photo Section */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Profile Photo
                </h3>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-lg">
                    {form.profilePhotoUrl ? (
                      <img
                        src={form.profilePhotoUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
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
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 file:font-semibold transition-all file:cursor-pointer"
                    />
                    <p className="text-xs text-gray-400 mt-2">Upload a professional photo. JPG, PNG or GIF (max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Username *</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Choose a unique username"
                    required
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-3">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="px-8 py-3 font-semibold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {saving ? (
                    <div className="flex items-center gap-3">
                      <MiniLoader size="sm" color="white" />
                      <span>Saving Changes...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
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
      </div>
    </div>
  );
}
