// src/pages/student/StudentProfile.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    about: {
      gender: "",
      location: "",
      primaryRole: "",
      experience: null, // User must manually input experience
    },
    socialProfiles: {
      linkedin: "",
      github: "",
      twitter: "",
      instagram: "",
      website: "",
    },
    education: [],
    skills: [],
    profilePhoto: null,
    profilePhotoUrl: "",
    resume: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [eduInput, setEduInput] = useState({
    id: Date.now(),
    degree: "",
    institution: "",
    fromYear: "",
    toYear: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [expInput, setExpInput] = useState("");
  const [expError, setExpError] = useState("");
  const [eduFormErrors, setEduFormErrors] = useState({});

  // ✅ Profile Completion % - Requires ALL 10 fields for 100% completion
  const calculateCompletion = () => {
    let total = 10; // Total requirements for 100% completion (REMOVED openToRoles)
    let filled = 0;

    // Basic profile information (4 requirements)
    if (profile.name && profile.name.trim()) filled++;
    if (profile.about.gender && profile.about.gender.trim()) filled++;
    if (profile.about.location && profile.about.location.trim()) filled++;
    if (profile.about.primaryRole && profile.about.primaryRole.trim()) filled++;

    // Experience - must be manually entered (not null/undefined and >= 0)
    if (
      profile.about.experience !== null &&
      profile.about.experience !== undefined &&
      profile.about.experience >= 0
    ) {
      filled++;
    }

    // Skills - must have at least one (1 requirement)
    if (profile.skills && profile.skills.length > 0) filled++;

    // Education - must have at least one complete entry (1 requirement)
    if (profile.education && profile.education.length > 0) {
      const hasCompleteEducation = profile.education.some(
        (edu) =>
          edu.degree &&
          edu.degree.trim() &&
          edu.institution &&
          edu.institution.trim() &&
          edu.fromYear &&
          edu.fromYear.toString().trim()
      );
      if (hasCompleteEducation) filled++;
    }

    // Profile photo (1 requirement)
    if (profile.profilePhotoUrl || profile.profilePhoto) filled++;

    // Resume - REQUIRED for 100% completion (1 requirement)
    if (profile.resume && profile.resume.trim()) filled++;

    // Social links - must have at least one non-empty social link (1 requirement)
    const socialLinks = profile.socialProfiles || {};
    const hasAtLeastOneSocialLink = Object.values(socialLinks).some(
      (link) => link && link.trim() && link.trim().length > 0
    );
    if (hasAtLeastOneSocialLink) filled++;

    return Math.round((filled / total) * 100);
  };
  const completionPercent = calculateCompletion();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/profile");
        const u = res?.data?.data || {};

        const mappedEducation = Array.isArray(u.education)
          ? u.education.map((e) => ({
              id: e.id || Date.now() + Math.random(),
              degree: e.degree || "",
              institution: e.institution || e.school || "",
              fromYear: e.fromYear || "",
              toYear: e.toYear || "",
            }))
          : [];

        const sp = u.socialProfiles || {};
        const mergedSP = {
          linkedin: sp.linkedin || "",
          github: sp.github || "",
          twitter: sp.x || sp.twitter || "", // Backend uses 'x' field
          instagram: sp.instagram || "",
          website: sp.website || "",
        };

        // Handle experience data - it's in about.experience
        let experienceValue = "";
        if (u.about?.experience !== undefined && u.about.experience !== null) {
          experienceValue = u.about.experience.toString();
        }

        setProfile((p) => ({
          ...p,
          name: u.name || p.name,
          about: {
            gender: u.about?.gender || p.about.gender,
            location: u.about?.location || p.about.location,
            primaryRole: u.about?.primaryRole || p.about.primaryRole,
            experience:
              u.about?.experience !== undefined ? u.about.experience : null, // Keep null if not set
          },
          socialProfiles: { ...p.socialProfiles, ...mergedSP },
          education: mappedEducation.length ? mappedEducation : p.education,
          skills: Array.isArray(u.skills) ? u.skills : p.skills,
          profilePhotoUrl: u.profilePhoto || "",
          resume: u.resume || "",
        }));

        setExpInput(experienceValue);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    // Check for validation errors before proceeding
    if (expError) {
      alert("Please fix the validation errors before saving");
      return;
    }

    setSaving(true);
    let body = {};
    try {
      // Handle profile photo upload separately if it's a new file
      if (profile.profilePhoto instanceof File) {
        const photoFd = new FormData();
        photoFd.append("profilePhoto", profile.profilePhoto);
        try {
          const photoRes = await api.patch("/profile/photo", photoFd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const updated = photoRes?.data?.data;
          if (updated?.profilePhoto) {
            setProfile((p) => ({
              ...p,
              profilePhotoUrl: updated.profilePhoto,
              profilePhoto: null,
            }));
          }
        } catch (photoError) {
          console.error("Profile photo upload error", photoError);
          // Continue with the rest of the save even if photo upload fails
        }
      }

      // Prepare and validate education data for the backend
      const educationData = (profile.education || [])
        .filter((edu) => edu.degree?.trim() && edu.institution?.trim()) // Remove incomplete entries
        .map((edu) => {
          const fromYear = parseInt(edu.fromYear);
          const toYear = edu.toYear ? parseInt(edu.toYear) : null;

          return {
            degree: edu.degree.trim(),
            school: edu.institution.trim(), // Backend expects 'school'
            fromYear: isNaN(fromYear) ? 0 : fromYear,
            toYear: toYear && !isNaN(toYear) ? toYear : null, // Set to null if invalid
          };
        })
        .filter((edu) => edu.degree && edu.school && edu.fromYear >= 1950);

      // Prepare and validate experience data
      const experienceValue = parseInt(expInput);
      if (expInput === "" || isNaN(experienceValue) || experienceValue < 0) {
        alert(
          "Please enter a valid number for years of experience (0 or greater)"
        );
        return;
      }

      // Clean and validate data
      const cleanedSkills = (profile.skills || [])
        .map((skill) => skill?.trim())
        .filter((skill) => skill && skill.length > 0);

      // Prepare about object
      const aboutData = {
        gender: profile.about.gender?.trim() || "",
        location: profile.about.location?.trim() || "",
        primaryRole: profile.about.primaryRole?.trim() || "",
        experience: experienceValue,
      };

      // Validate required fields
      if (!aboutData.gender || !aboutData.location || !aboutData.primaryRole) {
        alert(
          "Please fill in all required fields: Gender, Location, and Primary Role"
        );
        return;
      }

      // Prepare social profiles data - backend uses 'x' for Twitter
      const socialProfilesData = {
        linkedin: profile.socialProfiles?.linkedin?.trim() || "",
        github: profile.socialProfiles?.github?.trim() || "",
        x: profile.socialProfiles?.twitter?.trim() || "", // Backend uses 'x' field
        instagram: profile.socialProfiles?.instagram?.trim() || "",
        website: profile.socialProfiles?.website?.trim() || "",
      };

      body = {
        name: profile.name?.trim() || "",
        about: aboutData,
        education: educationData,
        skills: cleanedSkills,
        socialProfiles: socialProfilesData,
      };

      // Remove empty fields to avoid backend issues
      Object.keys(body).forEach((key) => {
        if (
          body[key] === "" ||
          (Array.isArray(body[key]) && body[key].length === 0)
        ) {
          delete body[key];
        }
      });

      const saveRes = await api.patch("/profile", body);

      const updated = saveRes?.data?.data;
      if (updated) {
        // Map education back to use 'institution' for frontend
        const mappedEducation = Array.isArray(updated.education)
          ? updated.education.map((e) => ({
              ...e,
              id: e.id || Date.now() + Math.random(),
              institution: e.institution || e.school || "",
            }))
          : [];

        setProfile((p) => ({
          ...p,
          name: updated.name || p.name,
          about: {
            gender: updated.about?.gender || p.about.gender,
            location: updated.about?.location || p.about.location,
            primaryRole: updated.about?.primaryRole || p.about.primaryRole,
            experience: updated.about?.experience || 0, // Update experience in about
          },
          socialProfiles: {
            ...p.socialProfiles,
            linkedin:
              updated.socialProfiles?.linkedin ?? p.socialProfiles.linkedin,
            github: updated.socialProfiles?.github ?? p.socialProfiles.github,
            twitter:
              updated.socialProfiles?.x ??
              updated.socialProfiles?.twitter ??
              p.socialProfiles.twitter, // Backend uses 'x' field
            instagram:
              updated.socialProfiles?.instagram ?? p.socialProfiles.instagram,
            website:
              updated.socialProfiles?.website ?? p.socialProfiles.website,
          },
          education: mappedEducation,
          skills: Array.isArray(updated.skills) ? updated.skills : p.skills,
          profilePhotoUrl: updated.profilePhoto || p.profilePhotoUrl,
          resume: updated.resume || p.resume,
        }));

        // Update experience input with the new value
        if (updated.about?.experience !== undefined) {
          setExpInput(updated.about.experience.toString());
        }
      }
    } catch (err) {
      console.error(
        "Save profile error:",
        err.response?.data?.message || err.message
      );
      alert(
        `Failed to save profile: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("resume", file);
    setUploading(true);
    try {
      const res = await api.patch("/profile/resume", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = res?.data?.data;

      if (updated?.resume) {
        setProfile((p) => ({ ...p, resume: updated.resume }));
      }
    } catch (err) {
      console.error(
        "Resume upload error:",
        err.response?.data?.message || err.message
      );
      alert(
        `Failed to upload resume: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!profile.resume) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your resume? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeletingResume(true);
    try {
      await api.delete("/profile/resume");
      setProfile((p) => ({ ...p, resume: "" }));
    } catch (err) {
      console.error(
        "Resume delete error:",
        err.response?.data?.message || err.message
      );
      alert(
        `Failed to delete resume: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setDeletingResume(false);
    }
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setProfile((p) => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
    setSkillInput("");
  };
  const removeSkill = (idx) => {
    setProfile((p) => ({ ...p, skills: p.skills.filter((_, i) => i !== idx) }));
  };

  const validateEducationForm = () => {
    const errors = {};
    if (!eduInput.degree.trim()) errors.degree = "Degree is required";
    if (!eduInput.institution.trim())
      errors.institution = "Institution is required";
    if (!eduInput.fromYear.trim()) {
      errors.fromYear = "Start year is required";
    } else {
      const fromYear = parseInt(eduInput.fromYear);

      if (isNaN(fromYear)) {
        errors.fromYear = "Invalid start year";
      } else if (fromYear < 1950 || fromYear > new Date().getFullYear() + 1) {
        errors.fromYear = "Start year must be between 1950 and next year";
      }

      // Only validate toYear if it's provided (optional field)
      if (eduInput.toYear && eduInput.toYear.trim()) {
        const toYear = parseInt(eduInput.toYear);
        if (isNaN(toYear)) {
          errors.toYear = "Invalid end year";
        } else if (toYear < fromYear) {
          errors.toYear = "End year cannot be before start year";
        }
      }
    }

    setEduFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addEducation = (e) => {
    if (e) e.preventDefault(); // Prevent form submission if called from form

    // Validate form
    if (!validateEducationForm()) {
      // Don't proceed if validation fails
      return;
    }

    // Parse years to ensure they're numbers
    const fromYear = parseInt(eduInput.fromYear);
    const toYear = eduInput.toYear ? parseInt(eduInput.toYear) : null;

    // Create a new education object
    const newEducation = {
      id: editingId || Date.now(),
      degree: eduInput.degree.trim(),
      institution: eduInput.institution.trim(),
      fromYear: isNaN(fromYear) ? "" : fromYear,
      toYear: toYear && !isNaN(toYear) ? toYear : "",
    };

    if (editingId) {
      // Update existing education
      setProfile((p) => ({
        ...p,
        education: p.education.map((edu) =>
          edu.id === editingId ? newEducation : edu
        ),
      }));
    } else {
      // Add new education
      setProfile((p) => ({
        ...p,
        education: [...p.education, newEducation],
      }));
    }

    // Reset form
    setEduInput({
      id: Date.now(),
      degree: "",
      institution: "",
      fromYear: "",
      toYear: "",
    });
    setEditingId(null);
    setEduFormErrors({});
  };

  const handleCancelEdit = () => {
    setEduInput({
      id: Date.now(),
      degree: "",
      institution: "",
      fromYear: "",
      toYear: "",
    });
    setEditingId(null);
    setEduFormErrors({});
  };

  const editEducation = (edu) => {
    setEduInput(edu);
    setEditingId(edu.id);
    setEduFormErrors({});
    // Scroll to form
    document
      .getElementById("education-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const deleteEducation = (id) => {
    setProfile((p) => ({
      ...p,
      education: p.education.filter((edu) => edu.id !== id),
    }));
  };

  const handleExperienceChange = (e) => {
    const value = e.target.value;
    setExpInput(value);

    // Clear error when user starts typing
    if (expError) {
      setExpError("");
    }

    // Update profile state with the parsed value
    if (value === "") {
      // Clear experience when input is empty
      setProfile((prev) => ({
        ...prev,
        about: { ...prev.about, experience: null },
      }));
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        // Valid number, update profile
        setProfile((prev) => ({
          ...prev,
          about: { ...prev.about, experience: numValue },
        }));
      } else {
        // Invalid input
        setExpError("Please enter a valid number of years (0 or greater)");
        setProfile((prev) => ({
          ...prev,
          about: { ...prev.about, experience: null },
        }));
      }
    }
  };

  if (loading) {
    return (
      <LoadingScreen 
        title="Loading Your Profile"
        subtitle="Preparing your dashboard experience..."
        steps={[
          { text: "Fetching profile data", color: "blue" },
          { text: "Loading education history", color: "purple" },
          { text: "Preparing form sections", color: "green" }
        ]}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start">
      <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
        {/* Header with Profile title and Progress Bar */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-3">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Profile Settings
            </h2>
            <p className="text-gray-400">
              Complete your profile to unlock all features
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-300 font-medium">
                Profile Completion
              </div>
              <div className="text-xl font-bold text-white">
                {completionPercent}%
              </div>
            </div>
            <div className="w-40 bg-neutral-700 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  completionPercent === 100
                    ? "bg-green-500 shadow-green-500/50"
                    : "bg-blue-500 shadow-blue-500/50"
                } shadow-lg`}
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile Photo Section */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile Photo
            </h3>
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-lg">
                {profile.profilePhotoUrl || profile.profilePhoto ? (
                  <img
                    src={
                      profile.profilePhoto
                        ? URL.createObjectURL(profile.profilePhoto)
                        : profile.profilePhotoUrl
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      profilePhoto: e.target.files?.[0] || null,
                      profilePhotoUrl: e.target.files?.[0]
                        ? URL.createObjectURL(e.target.files[0])
                        : profile.profilePhotoUrl,
                    })
                  }
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 file:font-semibold transition-all file:cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-3">
                  Upload a professional photo. JPG, PNG or GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Full Name *
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Gender *
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={profile.about.gender}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      about: { ...profile.about, gender: e.target.value },
                    })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Location *
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={profile.about.location}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      about: { ...profile.about, location: e.target.value },
                    })
                  }
                  placeholder="e.g., New York, USA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Primary Role *
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={profile.about.primaryRole}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      about: { ...profile.about, primaryRole: e.target.value },
                    })
                  }
                  placeholder="e.g., Frontend Developer"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="Enter years of experience (0 for fresh graduate)"
                  className={`w-full px-4 py-3 rounded-lg bg-neutral-800 border ${
                    expError ? "border-red-500" : "border-white/10"
                  } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  value={expInput}
                  onChange={handleExperienceChange}
                  required
                />
                {expError && (
                  <p className="text-red-400 text-sm mt-2">{expError}</p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  Enter 0 if you're a fresh graduate or new to the field
                </p>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div
            className="bg-white/5 rounded-xl border border-white/10 p-6"
            id="education-form"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Education
            </h3>

            {/* Education Input Form */}
            <div className="bg-neutral-800/30 rounded-lg p-4 mb-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-200">
                  {editingId ? "✏️ Edit Education" : "➕ Add Education"}
                </h4>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs py-2 px-4 rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                <div>
                  <input
                    placeholder="Degree (e.g., B.Tech, MBA)"
                    className={`w-full px-3 py-3 rounded-lg bg-neutral-700 border text-sm ${
                      eduFormErrors.degree
                        ? "border-red-500"
                        : "border-white/10"
                    } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    value={eduInput.degree}
                    onChange={(e) => {
                      setEduInput({ ...eduInput, degree: e.target.value });
                      if (eduFormErrors.degree) {
                        setEduFormErrors({ ...eduFormErrors, degree: "" });
                      }
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addEducation())
                    }
                  />
                  {eduFormErrors.degree && (
                    <p className="text-red-400 text-xs mt-1">
                      {eduFormErrors.degree}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    placeholder="Institution/University"
                    className={`w-full px-3 py-3 rounded-lg bg-neutral-700 border text-sm ${
                      eduFormErrors.institution
                        ? "border-red-500"
                        : "border-white/10"
                    } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    value={eduInput.institution}
                    onChange={(e) => {
                      setEduInput({ ...eduInput, institution: e.target.value });
                      if (eduFormErrors.institution) {
                        setEduFormErrors({ ...eduFormErrors, institution: "" });
                      }
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addEducation())
                    }
                  />
                  {eduFormErrors.institution && (
                    <p className="text-red-400 text-xs mt-1">
                      {eduFormErrors.institution}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    placeholder="Start Year"
                    className={`w-full px-3 py-3 rounded-lg bg-neutral-700 border text-sm ${
                      eduFormErrors.fromYear
                        ? "border-red-500"
                        : "border-white/10"
                    } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    value={eduInput.fromYear}
                    onChange={(e) => {
                      setEduInput({ ...eduInput, fromYear: e.target.value });
                      if (eduFormErrors.fromYear) {
                        setEduFormErrors({ ...eduFormErrors, fromYear: "" });
                      }
                    }}
                  />
                  {eduFormErrors.fromYear && (
                    <p className="text-red-400 text-xs mt-1">
                      {eduFormErrors.fromYear}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="number"
                    min="1950"
                    max="2100"
                    placeholder="End Year (Optional)"
                    className={`w-full px-3 py-3 rounded-lg bg-neutral-700 border text-sm ${
                      eduFormErrors.toYear
                        ? "border-red-500"
                        : "border-white/10"
                    } text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    value={eduInput.toYear}
                    onChange={(e) => {
                      setEduInput({ ...eduInput, toYear: e.target.value });
                      if (eduFormErrors.toYear) {
                        setEduFormErrors({ ...eduFormErrors, toYear: "" });
                      }
                    }}
                  />
                  {eduFormErrors.toYear && (
                    <p className="text-red-400 text-xs mt-1">
                      {eduFormErrors.toYear}
                    </p>
                  )}
                </div>

                <div className="flex items-start">
                  <button
                    type="button"
                    onClick={addEducation}
                    className="w-full py-3 px-4 font-semibold rounded-lg bg-blue-600 border border-blue-500 text-white hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                  >
                    {editingId ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>

            {/* Education List */}
            {profile.education.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                    <span>Your Education</span>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      {profile.education.length}
                    </span>
                  </h4>
                </div>
                <div className="space-y-3">
                  {profile.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="group relative bg-neutral-800/30 rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-white truncate">
                                {edu.degree}
                              </h5>
                              <p className="text-blue-300 text-xs truncate">
                                {edu.institution}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <div className="text-right">
                                <p className="text-xs text-gray-400 whitespace-nowrap">
                                  {edu.fromYear} - {edu.toYear || "Present"}
                                </p>
                                {!edu.toYear && (
                                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-900/50 text-blue-300">
                                    Pursuing
                                  </span>
                                )}
                              </div>
                              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => editEducation(edu)}
                                  className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-white/5 transition-all"
                                  title="Edit"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteEducation(edu.id)}
                                  className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all"
                                  title="Delete"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p className="text-lg font-medium mb-1">
                  No education added yet
                </p>
                <p className="text-sm">Add your educational background above</p>
              </div>
            )}
          </div>

          {/* Skills Section - Full Width with Better Layout */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Technical Skills
            </h3>
            <div className="flex gap-3 mb-4">
              <input
                placeholder="Add a skill (e.g., JavaScript, React, Python)"
                className="flex-1 px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSkill())
                }
              />
              <button
                type="button"
                onClick={addSkill}
                className="py-3 px-6 font-semibold rounded-lg bg-green-600 border border-green-500 text-white hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
              >
                Add Skill
              </button>
            </div>
            {profile.skills.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                    <span>Your Skills</span>
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                      {profile.skills.length}
                    </span>
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-2 rounded-full bg-green-900/50 border border-green-400 text-sm text-green-200 flex items-center gap-2 hover:bg-green-900/70 transition-colors cursor-pointer"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSkill(i);
                        }}
                        className="text-green-200 hover:text-red-400 transition-colors ml-1 hover:scale-110 transform"
                        title="Remove skill"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p className="text-lg font-medium mb-1">No skills added yet</p>
                <p className="text-sm">
                  Add your technical skills and expertise above
                </p>
              </div>
            )}
          </div>

          {/* Social Profiles & Resume Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Social Profiles */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Social Profiles
              </h3>
              <div className="space-y-5">
                {Object.keys(profile.socialProfiles).map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-300 mb-3 capitalize">
                      {key === "twitter" ? "X (Twitter)" : key}
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={profile.socialProfiles[key]}
                      placeholder={`Enter your ${
                        key === "twitter" ? "X (Twitter)" : key
                      } URL`}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          socialProfiles: {
                            ...profile.socialProfiles,
                            [key]: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Resume
              </h3>
              <div className="space-y-4">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 file:font-semibold transition-all file:cursor-pointer"
                />
                <p className="text-xs text-gray-400">
                  Upload your resume in PDF, DOC, or DOCX format (max 2MB)
                </p>

                {uploading && (
                  <div className="flex items-center gap-3 text-blue-400 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <MiniLoader size="md" color="blue" />
                    <div>
                      <p className="font-medium">Uploading Resume...</p>
                      <p className="text-xs text-blue-300">Please wait while we process your file</p>
                    </div>
                  </div>
                )}

                {profile.resume ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-400 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Resume uploaded successfully
                    </div>
                    <div className="flex gap-3">
                      <a
                        href={
                          profile.resume.startsWith("http")
                            ? profile.resume
                            : `${
                                import.meta.env.VITE_API_BASE_URL ||
                                "http://localhost:3000"
                              }${profile.resume}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition group"
                      >
                        <svg
                          className="w-4 h-4 group-hover:scale-110 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </a>

                      <button
                        type="button"
                        onClick={handleResumeDelete}
                        disabled={deletingResume}
                        className="flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-red-500/20 hover:border-red-500/50 transition group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          className="w-4 h-4 group-hover:scale-110 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        {deletingResume ? (
                          <MiniLoader size="sm" color="red" text="Deleting..." />
                        ) : (
                          <>Delete</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-lg font-medium mb-1">
                      No resume uploaded yet
                    </p>
                    <p className="text-sm">
                      Upload your resume above to complete your profile
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-12 py-4 text-lg font-bold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {saving ? (
                <div className="flex items-center gap-3">
                  <MiniLoader size="md" color="white" />
                  <span>Saving Profile...</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Profile
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
