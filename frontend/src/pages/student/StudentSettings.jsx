// src/pages/student/StudentSettings.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function StudentSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);

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
      alert("Profile updated ✅");
    } catch (err) {
      console.error("[save general]", err);
      alert("Failed to update ❌");
    } finally {
      setSaving(false);
    }
  }

  // ✅ Change password
  async function changePassword(e) {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }
    setChanging(true);
    try {
      await api.patch("/settings/password", {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
        confirmNewPassword: pwd.confirmPassword,
      });
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      alert("Password updated ✅");
    } catch (err) {
      console.error("[change password]", err);
      alert("Failed to update password ❌");
    } finally {
      setChanging(false);
    }
  }

  const containerStyle = {
    padding: "1.1rem",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: "0.5rem",
    minHeight: "calc(100vh - 8rem)",
  };

  if (loading)
    return (
      <div style={containerStyle} className="text-gray-300">
        Loading settings…
      </div>
    );

  return (
    <div style={containerStyle}>
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 ${
            activeTab === "general"
              ? "border-b-2 border-white text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 ${
            activeTab === "password"
              ? "border-b-2 border-white text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Password
        </button>
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <form
          onSubmit={saveGeneral}
          className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold mb-4">Update Profile</h2>

          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <div className="w-27 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {form.profilePhotoUrl ? (
                <img
                  src={form.profilePhotoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">No photo</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({
                  ...form,
                  profilePhoto: e.target.files[0],
                  profilePhotoUrl: e.target.files[0]
                    ? URL.createObjectURL(e.target.files[0])
                    : form.profilePhotoUrl,
                })
              }
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/20 file:text-gray-300 hover:file:bg-white/10"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white"
              required
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <form
          onSubmit={changePassword}
          className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={pwd.currentPassword}
              onChange={(e) =>
                setPwd({ ...pwd, currentPassword: e.target.value })
              }
              required
              className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={pwd.newPassword}
              onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={pwd.confirmPassword}
              onChange={(e) =>
                setPwd({ ...pwd, confirmPassword: e.target.value })
              }
              required
              className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={changing}
            className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
          >
            {changing ? "Updating…" : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}
