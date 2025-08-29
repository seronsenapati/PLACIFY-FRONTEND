// src/pages/student/StudentProfile.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    about: {
      gender: "",
      location: "",
      primaryRole: "",
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
    experience: [],
    openToRoles: [],
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
  const [roleInput, setRoleInput] = useState("");

  const containerStyle = {
    padding: "1.3rem",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: "0.5rem",
    minHeight: "calc(100vh - 8rem)",
  };

  // ✅ Profile Completion %
  const calculateCompletion = () => {
    let total = 8;
    let filled = 0;
    if (profile.name) filled++;
    if (profile.about.gender) filled++;
    if (profile.about.location) filled++;
    if (profile.about.primaryRole) filled++;
    if (profile.skills.length > 0) filled++;
    if (profile.education.length > 0) filled++;
    if (profile.profilePhotoUrl || profile.profilePhoto) filled++;
    if (profile.resume) filled++;
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
          twitter: sp.twitter ?? sp.x ?? "",
          instagram: sp.instagram || "",
          website: sp.website || "",
        };

        setProfile((p) => ({
          ...p,
          name: u.name || p.name,
          about: {
            gender: u.about?.gender || p.about.gender,
            location: u.about?.location || p.about.location,
            primaryRole: u.about?.primaryRole || p.about.primaryRole,
          },
          socialProfiles: { ...p.socialProfiles, ...mergedSP },
          education: mappedEducation.length ? mappedEducation : p.education,
          skills: Array.isArray(u.skills) ? u.skills : p.skills,
          experience: Array.isArray(u.experience) ? u.experience : [],
          openToRoles: Array.isArray(u.openToRoles) ? u.openToRoles : [],
          profilePhotoUrl: u.profilePhoto || "",
          resume: u.resume || "",
        }));
      } catch (err) {
        console.error("Load profile error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profile.profilePhoto instanceof File) {
        const photoFd = new FormData();
        photoFd.append("profilePhoto", profile.profilePhoto);
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
      }

      const mappedEdu = profile.education.map((e) => ({
        degree: e.degree,
        school: e.institution,
        fromYear: e.fromYear,
        toYear: e.toYear,
      }));

      const body = {
        name: profile.name,
        about: profile.about,
        socialProfiles: {
          ...profile.socialProfiles,
          x: profile.socialProfiles.twitter,
        },
        education: mappedEdu,
        skills: profile.skills,
        experience: profile.experience,
        openToRoles: profile.openToRoles,
      };

      const saveRes = await api.patch("/profile", body);
      const updated = saveRes?.data?.data;
      if (updated) {
        setProfile((p) => ({
          ...p,
          name: updated.name || p.name,
          about: {
            gender: updated.about?.gender || p.about.gender,
            location: updated.about?.location || p.about.location,
            primaryRole: updated.about?.primaryRole || p.about.primaryRole,
          },
          socialProfiles: {
            ...p.socialProfiles,
            linkedin: updated.socialProfiles?.linkedin ?? p.socialProfiles.linkedin,
            github: updated.socialProfiles?.github ?? p.socialProfiles.github,
            twitter:
              updated.socialProfiles?.twitter ??
              updated.socialProfiles?.x ??
              p.socialProfiles.twitter,
            instagram: updated.socialProfiles?.instagram ?? p.socialProfiles.instagram,
            website: updated.socialProfiles?.website ?? p.socialProfiles.website,
          },
          education: Array.isArray(updated.education) ? updated.education : p.education,
          skills: Array.isArray(updated.skills) ? updated.skills : p.skills,
          experience: Array.isArray(updated.experience) ? updated.experience : p.experience,
          openToRoles: Array.isArray(updated.openToRoles) ? updated.openToRoles : p.openToRoles,
          profilePhotoUrl: updated.profilePhoto || p.profilePhotoUrl,
          resume: updated.resume || p.resume,
        }));
      }
    } catch (err) {
      console.error("Save profile error", err);
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
      console.error("Resume upload error", err);
    } finally {
      setUploading(false);
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

  const addEducation = (e) => {
    e.preventDefault(); // Prevent form submission
    
    // Basic validation
    if (!eduInput.degree.trim() || !eduInput.institution.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create a new education object
    const newEducation = {
      id: editingId || Date.now(),
      degree: eduInput.degree.trim(),
      institution: eduInput.institution.trim(),
      fromYear: eduInput.fromYear,
      toYear: eduInput.toYear
    };
    
    if (editingId) {
      // Update existing education
      setProfile(p => ({
        ...p,
        education: p.education.map(edu => 
          edu.id === editingId ? newEducation : edu
        )
      }));
    } else {
      // Add new education
      setProfile(p => ({
        ...p,
        education: [...p.education, newEducation]
      }));
    }
    
    // Reset form
    setEduInput({
      id: Date.now(),
      degree: "",
      institution: "",
      fromYear: "",
      toYear: ""
    });
    setEditingId(null);
  };
  
  const editEducation = (edu) => {
    setEduInput(edu);
    setEditingId(edu.id);
    // Scroll to form
    document.getElementById('education-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const deleteEducation = (id) => {
    setProfile(p => ({
      ...p,
      education: p.education.filter(edu => edu.id !== id)
    }));
  };

  const handleExperienceChange = (e) => {
    const value = e.target.value;
    setExpInput(value);
    // Update profile with the single experience value
    setProfile(p => ({
      ...p,
      experience: value ? [{ yearsOfExperience: value }] : []
    }));
  };

  const addOpenRole = () => {
    if (!roleInput.trim()) return;
    setProfile((p) => ({ ...p, openToRoles: [...p.openToRoles, roleInput.trim()] }));
    setRoleInput("");
  };

  const removeOpenRole = (index) => {
    setProfile(p => ({
      ...p,
      openToRoles: p.openToRoles.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div className="text-gray-300 p-6">Loading profile…</div>;

  return (
    <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start">
      <div style={containerStyle} className="w-full max-w-8xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-white">Profile</h2>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Profile Completion</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full ${
                completionPercent === 100 ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <div className="w-27 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
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
                <span className="text-gray-400 text-sm">No photo</span>
              )}
            </div>
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
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/20 file:text-gray-300 hover:file:bg-white/10"
            />
          </div>

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Name</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-md bg-neutral-800 border border-white/10 text-white"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Gender</label>
              <select
                className="mt-1 w-full px-3 py-2 rounded-md bg-neutral-800 border border-white/10 text-white"
                value={profile.about.gender}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    about: { ...profile.about, gender: e.target.value },
                  })
                }
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Where are you based?</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-md bg-neutral-800 border border-white/10 text-white"
                value={profile.about.location}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    about: { ...profile.about, location: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Primary Role</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-md bg-neutral-800 border border-white/10 text-white"
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
          </div>

          {/* Education */}
          <div id="education-form">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Education</h3>
            
            {/* Education Input Form */}
            <form onSubmit={addEducation} className="bg-neutral-800/50 rounded-xl p-4 mb-6 border border-white/5">
              <h4 className="text-md font-medium text-gray-200 mb-4">
                {editingId ? 'Edit Education' : 'Add New Education'}
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                Add all your educational qualifications (most recent first)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Degree*</label>
                  <input
                    required
                    placeholder="e.g., Bachelor of Technology"
                    className="w-full px-4 py-2 rounded-lg bg-neutral-700 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={eduInput.degree}
                    onChange={(e) => setEduInput({ ...eduInput, degree: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Institution*</label>
                  <input
                    required
                    placeholder="e.g., Massachusetts Institute of Technology"
                    className="w-full px-4 py-2 rounded-lg bg-neutral-700 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={eduInput.institution}
                    onChange={(e) => setEduInput({ ...eduInput, institution: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Year*</label>
                  <input
                    required
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    placeholder="e.g., 2018"
                    className="w-full px-4 py-2 rounded-lg bg-neutral-700 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={eduInput.fromYear}
                    onChange={(e) => setEduInput({ ...eduInput, fromYear: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Year (or expected)</label>
                  <input
                    type="number"
                    min="1950"
                    max="2100"
                    placeholder="e.g., 2022"
                    className="w-full px-4 py-2 rounded-lg bg-neutral-700 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={eduInput.toYear}
                    onChange={(e) => setEduInput({ ...eduInput, toYear: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEduInput({
                        id: Date.now(),
                        degree: "",
                        institution: "",
                        fromYear: "",
                        toYear: ""
                      });
                      setEditingId(null);
                    }}
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!eduInput.degree?.trim() || !eduInput.institution?.trim()}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    !eduInput.degree?.trim() || !eduInput.institution?.trim()
                      ? 'bg-blue-900/50 text-blue-400/50 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } transition-colors`}
                >
                  {editingId ? 'Update Education' : 'Add Education'}
                </button>
              </div>
            </form>
            
            {/* Education List */}
            <div className="space-y-3">
              {profile.education.map((edu) => (
                <div key={edu.id} className="group relative bg-neutral-800/50 rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-md font-medium text-white">{edu.degree}</h4>
                      <p className="text-blue-300 text-sm">{edu.institution}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {edu.fromYear} - {edu.toYear || 'Present'}
                        {!edu.toYear && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-900/50 text-blue-300">
                            Pursuing
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => editEducation(edu)}
                        className="p-1.5 text-gray-400 hover:text-blue-400 rounded-full hover:bg-white/5"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteEducation(edu.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-full hover:bg-white/5"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Years of Experience</h3>
            <div className="w-full">
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Enter years of experience"
                className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-white/10 text-white"
                value={expInput}
                onChange={handleExperienceChange}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Skills</h3>
            <div className="flex gap-2">
              <input
                placeholder="Add a skill"
                className="flex-1 px-3 py-2 rounded-md bg-neutral-800 border border-white/10 text-white"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.skills.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-green-900/50 border border-green-400 text-sm text-green-200 flex items-center"
                >
                  {s}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSkill(i);
                    }}
                    className="ml-2 text-green-200 hover:text-red-400 transition-colors"
                    title="Remove skill"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Open to Roles */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Open to Roles</h3>
            <div className="flex gap-2">
              <input
                placeholder="e.g., Backend Developer"
                className="flex-1 px-3 py-2 rounded-md bg-neutral-800 border border-white/10 text-white"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
              />
              <button
                type="button"
                onClick={addOpenRole}
                className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.openToRoles.map((role, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-purple-900/50 border border-purple-400 text-sm text-purple-200 flex items-center"
                >
                  {role}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOpenRole(i);
                    }}
                    className="ml-2 text-purple-200 hover:text-red-400 transition-colors"
                    title="Remove role"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Social Profiles</h3>
            {Object.keys(profile.socialProfiles).map((key) => (
              <div key={key} className="mb-2">
                <label className="text-sm text-gray-400 capitalize">{key}</label>
                <input
                  className="mt-1 w-full px-3 py-2 rounded-md bg-neutral-800 border border-white/10 text-white"
                  value={profile.socialProfiles[key]}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialProfiles: { ...profile.socialProfiles, [key]: e.target.value },
                    })
                  }
                />
              </div>
            ))}
          </div>

          {/* Resume */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Resume</h3>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/20 file:text-gray-300 hover:file:bg-white/10"
            />
            {uploading && <p className="text-gray-400 text-sm mt-1">Uploading...</p>}
            {profile.resume && (
              <a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-sm mt-2 block hover:underline"
              >
                View Resume
              </a>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
