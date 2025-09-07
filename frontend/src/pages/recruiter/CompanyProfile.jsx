import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";
import { getRole } from "../../utils/auth";

export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [company, setCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null); // For previewing selected logo
  const logoInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    website: "",
    location: "",
    industry: "",
    size: "1-10",
    employeeCount: "",
    socialMedia: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: ""
    }
  });

  // Industry options based on backend model
  const industryOptions = [
    "Technology", 
    "Finance", 
    "Healthcare", 
    "Education", 
    "Manufacturing", 
    "Retail", 
    "Hospitality",
    "Transportation",
    "Media",
    "Entertainment",
    "Real Estate",
    "Energy",
    "Telecommunications",
    "Agriculture",
    "Government",
    "Non-profit",
    "Other"
  ];

  // Company size options based on backend model
  const sizeOptions = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
  
  // Make these available at the module level for validation
  const validIndustryOptions = new Set(industryOptions);
  const validSizeOptions = new Set(sizeOptions);

  // Verify user is recruiter
  const role = getRole();
  const userId = localStorage.getItem('userId');
  console.log("[Company Profile] Current role:", role);
  console.log("[Company Profile] Current userId:", userId);
  
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
  
  // Check if userId exists for recruiters
  if (!userId) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex justify-center items-center">
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-white">Authentication Error</h2>
          </div>
          <p className="text-gray-300 mb-4">
            User ID not found. Please log in again.
          </p>
          <div className="mt-6">
            <a 
              href="/login" 
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

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

  // Fetch company profile on mount
  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  async function fetchCompanyProfile() {
    try {
      setLoading(true);
      const res = await api.get("/companies");
      console.log("[fetch company profile] Response:", res.data);
      
      // Check if recruiter has a company
      if (res.data?.data?.companies && res.data.data.companies.length > 0) {
        // Get user ID for filtering
        const currentUserId = localStorage.getItem('userId');
        console.log("[fetch company profile] Current user ID:", currentUserId);
        
        // Find company created by current user
        const userCompany = res.data.data.companies.find(
          comp => comp.createdBy === currentUserId
        );
        
        if (userCompany) {
          console.log("[fetch company profile] Found user company:", userCompany);
          setCompany(userCompany);
          setFormData({
            name: userCompany.name || "",
            desc: userCompany.desc || "",
            website: userCompany.website || "",
            location: userCompany.location || "",
            industry: userCompany.industry || "",
            size: userCompany.size || "1-10",
            employeeCount: userCompany.employeeCount || "",
            socialMedia: {
              linkedin: userCompany.socialMedia?.linkedin || "",
              twitter: userCompany.socialMedia?.twitter || "",
              facebook: userCompany.socialMedia?.facebook || "",
              instagram: userCompany.socialMedia?.instagram || ""
            }
          });
        }
      }
    } catch (err) {
      console.error("[fetch company profile]", err);
      
      if (err.response?.status === 403) {
        setErrorMsg("Access denied. Please ensure you are logged in as a recruiter.");
      } else if (err.response?.status === 401) {
        setErrorMsg("Authentication required. Please log in again.");
      } else {
        const errorMessage = err.response?.data?.message || "Failed to load company profile";
        setErrorMsg(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    
    // Handle nested socialMedia fields
    if (name.startsWith("socialMedia.")) {
      const socialField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }

  // Modified form submission to handle logo upload after company creation
  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      setErrorMsg("Company name is required");
      return;
    }
    
    if (!formData.website.trim()) {
      setErrorMsg("Website is required");
      return;
    }
    
    if (!formData.desc.trim()) {
      setErrorMsg("Description is required");
      return;
    }
    
    // Additional validation for field lengths
    if (formData.name.trim().length < 2) {
      setErrorMsg("Company name must be at least 2 characters long");
      return;
    }
    
    if (formData.name.trim().length > 100) {
      setErrorMsg("Company name must be less than 100 characters");
      return;
    }
    
    if (formData.desc.trim().length < 10) {
      setErrorMsg("Description must be at least 10 characters long");
      return;
    }
    
    if (formData.desc.trim().length > 2000) {
      setErrorMsg("Description must be less than 2000 characters");
      return;
    }
    
    // Validate URL format
    try {
      new URL(formData.website);
    } catch (err) {
      setErrorMsg("Please enter a valid website URL (e.g., https://example.com)");
      return;
    }
    
    // Also validate that website starts with http or https
    if (!formData.website.startsWith('http://') && !formData.website.startsWith('https://')) {
      setErrorMsg("Website URL must start with http:// or https://");
      return;
    }
    
    // Validate employeeCount if provided
    if (formData.employeeCount && (isNaN(parseInt(formData.employeeCount, 10)) || parseInt(formData.employeeCount, 10) < 0)) {
      setErrorMsg("Employee count must be a valid positive number");
      return;
    }
    
    // Validate social media URLs if provided
    const socialMediaFields = ['linkedin', 'twitter', 'facebook', 'instagram'];
    const correctedSocialMedia = { ...formData.socialMedia };
    
    for (const field of socialMediaFields) {
      if (formData.socialMedia[field] && formData.socialMedia[field].trim() !== '') {
        try {
          // Add protocol if missing
          let url = formData.socialMedia[field];
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          new URL(url);
          // Update the corrected social media object
          correctedSocialMedia[field] = url;
        } catch (err) {
          setErrorMsg(`Please enter a valid ${field} URL or leave it empty`);
          return;
        }
      }
    }
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      name: formData.name.trim(),
      desc: formData.desc.trim(),
      location: formData.location.trim(),
      socialMedia: correctedSocialMedia,
      employeeCount: formData.employeeCount ? parseInt(formData.employeeCount, 10) : undefined
    };
    
    // Validate industry and size
    if (formData.industry && !validIndustryOptions.has(formData.industry)) {
      setErrorMsg("Please select a valid industry from the dropdown");
      setSaving(false);
      return;
    }
    
    if (formData.size && !validSizeOptions.has(formData.size)) {
      setErrorMsg("Please select a valid company size from the dropdown");
      setSaving(false);
      return;
    }
    
    // Only include industry and size if they are selected
    if (!formData.industry) delete submitData.industry;
    if (!formData.size) delete submitData.size;
    
    // Add createdBy field for new companies
    if (!company) {
      const userId = localStorage.getItem('userId');
      console.log("[Company Profile] User ID from localStorage:", userId);
      if (!userId) {
        setErrorMsg("User ID not found. Please log in again.");
        setSaving(false);
        return;
      }
      submitData.createdBy = userId;
    }
    
    // Remove empty fields
    if (!submitData.employeeCount && submitData.employeeCount !== 0) {
      delete submitData.employeeCount;
    } else if (submitData.employeeCount) {
      // Ensure employeeCount is a number
      submitData.employeeCount = parseInt(submitData.employeeCount, 10);
    }
    
    // Remove other empty fields
    if (!submitData.location) delete submitData.location;
    if (!submitData.industry) delete submitData.industry;
    if (!submitData.size) delete submitData.size;
    
    // Clean up empty social media fields
    Object.keys(submitData.socialMedia).forEach(key => {
      if (!submitData.socialMedia[key] || submitData.socialMedia[key].trim() === '') {
        delete submitData.socialMedia[key];
      }
    });
    
    // Log the data being sent for debugging
    console.log("[Company Profile] Sending data:", submitData);
    
    // Also log the raw form data for comparison
    console.log("[Company Profile] Raw form data:", formData);
    
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      let res;
      const isUpdating = !!company;
      
      if (isUpdating) {
        // Update existing company
        console.log("[Company Profile] Updating company with ID:", company._id);
        res = await api.patch(`/companies/${company._id}`, submitData);
      } else {
        // Create new company
        console.log("[Company Profile] Creating new company");
        res = await api.post("/companies", submitData);
      }
      
      setCompany(res.data.data);
      setSuccessMsg(isUpdating ? "Company profile updated successfully!" : "Company profile created successfully!");
      
      // If we have a logo file waiting and just created a company, upload it now
      if (!isUpdating && logoFile) {
        console.log("[handleSubmit] Uploading logo after company creation");
        try {
          await uploadLogo(logoFile);
        } catch (logoError) {
          console.error("[handleSubmit] Failed to upload logo after company creation:", logoError);
          // Still consider the company creation successful, just notify about logo issue
          setSuccessMsg("Company profile created successfully! However, there was an issue uploading the logo. You can try uploading it again.");
        } finally {
          // Clear logo file state regardless of success or failure
          setLogoFile(null);
          setLogoPreview(null);
          if (logoInputRef.current) {
            logoInputRef.current.value = "";
          }
        }
      } else if (isUpdating && logoFile) {
        // If we're updating and have a logo file, upload it now
        console.log("[handleSubmit] Uploading logo during company update");
        try {
          await uploadLogo(logoFile);
        } catch (logoError) {
          console.error("[handleSubmit] Failed to upload logo during company update:", logoError);
          // Still consider the company update successful, just notify about logo issue
          setErrorMsg("Company profile updated successfully! However, there was an issue updating the logo.");
        } finally {
          // Clear logo file state regardless of success or failure
          setLogoFile(null);
          setLogoPreview(null);
          if (logoInputRef.current) {
            logoInputRef.current.value = "";
          }
        }
      } else if (!isUpdating) {
        // Clear the file input if no logo was selected for new company
        if (logoInputRef.current) {
          logoInputRef.current.value = "";
        }
        // Also clear any temporary logo state
        setLogoFile(null);
        setLogoPreview(null);
      }
      
      setIsEditing(false);
      setShowForm(false);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (err) {
      console.error("[save company profile]", err);
      
      if (err.response?.status === 403) {
        setErrorMsg("Access denied. Please ensure you are logged in as a recruiter.");
      } else if (err.response?.status === 401) {
        setErrorMsg("Authentication required. Please log in again.");
      } else {
        // Show more detailed error information
        let errorMessage = "Failed to save company profile";
        
        // Log the full error response for debugging
        console.log("Full error response:", err.response);
        
        // Check for validation errors in the response
        if (err.response?.data?.errors) {
          // Format validation errors
          const formattedErrors = formatValidationErrors(err.response.data.errors);
          if (formattedErrors) {
            errorMessage = formattedErrors;
          }
          console.log("Validation errors:", err.response.data.errors);
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.statusText) {
          errorMessage = `Error ${err.response.status}: ${err.response.statusText}`;
        }
        
        // If we still don't have a specific error message, show the status
        if (errorMessage === "Failed to save company profile" && err.response?.status) {
          errorMessage = `Server error (${err.response.status}): ${err.response.statusText || 'Bad Request'}`;
        }
        
        setErrorMsg(errorMessage);
        
        // Log detailed error for debugging
        console.error("Detailed error info:", {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers
        });
      }
    } finally {
      setSaving(false);
    }
  }

  // Modified logo upload function
  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Please upload a valid image file (JPG, PNG, or GIF)");
      // Clear the file input
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size must be less than 5MB");
      // Clear the file input
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    // Store the file temporarily if company doesn't exist yet
    if (!company) {
      setLogoFile(file);
      setSuccessMsg("Logo selected! It will be uploaded after you create your company profile.");
      return;
    }

    // If company exists, upload immediately
    // Ensure company object has an _id before attempting upload
    if (company && company._id) {
      await uploadLogo(file);
    } else {
      setErrorMsg("Company information not available. Please try again.");
      // Clear the file input
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  }

  // Separate function to handle actual logo upload
  async function uploadLogo(file) {
    // Ensure we have a valid company ID
    if (!company || !company._id) {
      setErrorMsg("Company information not available. Please try again.");
      setUploadingLogo(false);
      return;
    }
    
    // Log file information for debugging
    console.log("[uploadLogo] File info:", {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const fd = new FormData();
    fd.append("logo", file);
    
    console.log("[uploadLogo] FormData entries:");
    for (let [key, value] of fd.entries()) {
      console.log(key, value);
    }
    
    console.log("[uploadLogo] Uploading logo file:", file);
    console.log("[uploadLogo] Company ID:", company._id);
    
    setUploadingLogo(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      // The api service will now handle FormData properly
      const res = await api.patch(`/companies/${company._id}`, fd);
      
      console.log("[uploadLogo] Success response:", res.data);
      setCompany(res.data.data);
      setLogoFile(null); // Clear temporary file
      setLogoPreview(null); // Clear preview
      // Clear the file input
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
      setSuccessMsg("Company logo updated successfully!");
    } catch (err) {
      console.error("[upload company logo]", err);
      console.log("[uploadLogo] Error response:", err.response);
      
      if (err.response?.status === 403) {
        setErrorMsg("Access denied. Please ensure you are logged in as a recruiter.");
      } else if (err.response?.status === 401) {
        setErrorMsg("Authentication required. Please log in again.");
      } else if (err.response?.status === 400) {
        // Handle specific validation errors for logo upload
        let errorMessage = "Failed to upload company logo";
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.data?.errors) {
          // Handle validation errors
          const errors = err.response.data.errors;
          if (Array.isArray(errors) && errors.length > 0) {
            errorMessage = errors.map(e => e.msg || e.message || JSON.stringify(e)).join(", ");
          } else if (typeof errors === 'object') {
            errorMessage = Object.values(errors).join(", ");
          }
        }
        setErrorMsg(errorMessage);
      } else {
        const errorMessage = err.response?.data?.message || "Failed to upload company logo";
        setErrorMsg(errorMessage);
      }
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleDeleteCompany() {
    if (!company) return;
    
    if (!window.confirm("Are you sure you want to delete your company profile? This action cannot be undone.")) {
      return;
    }
    
    setDeleting(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      await api.delete(`/companies/${company._id}`);
      setCompany(null);
      setFormData({
        name: "",
        desc: "",
        website: "",
        location: "",
        industry: "",
        size: "1-10",
        employeeCount: "",
        socialMedia: {
          linkedin: "",
          twitter: "",
          facebook: "",
          instagram: ""
        }
      });
      setSuccessMsg("Company profile deleted successfully!");
    } catch (err) {
      console.error("[delete company profile]", err);
      
      if (err.response?.status === 403) {
        setErrorMsg("Access denied. You don't have permission to delete this company.");
      } else if (err.response?.status === 401) {
        setErrorMsg("Authentication required. Please log in again.");
      } else {
        const errorMessage = err.response?.data?.message || "Failed to delete company profile";
        setErrorMsg(errorMessage);
      }
    } finally {
      setDeleting(false);
    }
  }

  function handleCancel() {
    // Reset form to original values
    if (company) {
      setFormData({
        name: company.name || "",
        desc: company.desc || "",
        website: company.website || "",
        location: company.location || "",
        industry: company.industry || "",
        size: company.size || "1-10",
        employeeCount: company.employeeCount || "",
        socialMedia: {
          linkedin: company.socialMedia?.linkedin || "",
          twitter: company.socialMedia?.twitter || "",
          facebook: company.socialMedia?.facebook || "",
          instagram: company.socialMedia?.instagram || ""
        }
      });
    } else {
      // Reset to empty form
      setFormData({
        name: "",
        desc: "",
        website: "",
        location: "",
        industry: "",
        size: "1-10",
        employeeCount: "",
        socialMedia: {
          linkedin: "",
          twitter: "",
          facebook: "",
          instagram: ""
        }
      });
    }
    // Clear logo file and input when canceling
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
    setIsEditing(false);
    setShowForm(false);
  }

  if (loading) {
    return (
      <LoadingScreen 
        title="Loading Company Profile"
        subtitle="Please wait while we load your company information..."
        steps={[
          { text: "Fetching company data", color: "blue" },
          { text: "Loading profile details", color: "purple" },
          { text: "Preparing dashboard", color: "green" }
        ]}
      />
    );
  }

  // If recruiter has a company and is not editing, show company card
  if (company && !showForm && !isEditing) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start">
        <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Company Profile</h1>
                <p className="text-gray-400 mt-1">
                  Manage your company information
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowForm(true);
                  }}
                  disabled={saving || uploadingLogo || deleting}
                  className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {saving || uploadingLogo || deleting ? (
                    <MiniLoader />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                  Edit
                </button>
                
                <button
                  onClick={handleDeleteCompany}
                  disabled={deleting || saving || uploadingLogo}
                  className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-red-500/20 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {deleting ? (
                    <MiniLoader />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" />
                    </svg>
                  )}
                  Delete
                </button>
              </div>
            </div>

            {/* Messages */}
            {(errorMsg || successMsg) && (
              <div className={`p-4 rounded-lg ${errorMsg ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {errorMsg ? (
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className={errorMsg ? 'text-red-300' : 'text-green-300'}>
                      {errorMsg || successMsg}
                    </span>
                  </div>
                  <button 
                    onClick={() => { setErrorMsg(""); setSuccessMsg(""); }}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Company Card */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <h2 className="text-xl font-semibold">Company Information</h2>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-24 h-24 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-white/30">
                    {company?.logo ? (
                      <img
                        src={company.logo}
                        alt="Company Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">{company.name}</h3>
                    <p className="text-gray-300 mt-1">{company.location || "Location not specified"}</p>
                    
                    <div className="mt-4">
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        Visit Website
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-gray-300">{company.desc || "No description provided"}</p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Industry</p>
                      <p className="text-white">{company.industry || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Company Size</p>
                      <p className="text-white">{company.size ? `${company.size} employees` : "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Company Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Profile Completeness</p>
                    <p className="text-xl font-bold">{company.profileCompleteness || 0}%</p>
                  </div>
                </div>
                <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${company.profileCompleteness || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Average Rating</p>
                    <p className="text-xl font-bold">{company.averageRating || 0}/5</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg 
                      key={star}
                      className={`w-4 h-4 ${star <= (company.averageRating || 0) ? 'text-amber-400' : 'text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-400 ml-2">({company.reviewCount || 0} reviews)</span>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Jobs Posted</p>
                    <p className="text-xl font-bold">{company.jobs?.length || 0}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href="/recruiter/jobs" 
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    Manage jobs
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If recruiter doesn't have a company or is creating/editing, show the form
  return (
    <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start">
      <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Company Profile</h1>
              <p className="text-gray-400 mt-1">
                {company 
                  ? "Edit your company information" 
                  : "Create your company profile to start posting jobs"}
              </p>
            </div>
            
            {(company && !showForm) && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          {/* Messages */}
          {(errorMsg || successMsg) && (
            <div className={`p-4 rounded-lg ${errorMsg ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {errorMsg ? (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={errorMsg ? 'text-red-300' : 'text-green-300'}>
                    {errorMsg || successMsg}
                  </span>
                </div>
                <button 
                  onClick={() => { setErrorMsg(""); setSuccessMsg(""); }}
                  className="hover:opacity-70 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Show register button if no company exists and not showing form */}
          {!company && !showForm && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Company Profile Found</h3>
              <p className="text-gray-400 mb-6">
                Create your company profile to start posting jobs and connecting with talented candidates.
              </p>
              <button
                onClick={() => setShowForm(true)}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <MiniLoader />
                    Loading...
                  </div>
                ) : (
                  "Register Company"
                )}
              </button>
            </div>
          )}

          {/* Company Profile Form */}
          {(showForm || company) && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <h2 className="text-xl font-semibold">
                  {company ? "Edit Company Profile" : "Create Company Profile"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {company 
                    ? "Update your company details below" 
                    : "Fill in your company information to get started"}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Company Logo Section - Always show for recruiters */}
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-medium text-white mb-4">Company Logo</h3>
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="w-24 h-24 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-white/30">
                      {/* Show preview if available, otherwise show existing logo or default icon */}
                      {logoPreview || company?.logo ? (
                        <img
                          src={logoPreview || company.logo}
                          alt="Company Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 file:font-medium transition-all file:cursor-pointer disabled:opacity-50"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Upload your company logo. JPG, PNG or GIF (max 5MB)
                      </p>
                      {uploadingLogo && (
                        <div className="flex items-center gap-2 mt-2 text-blue-400">
                          <MiniLoader />
                          <span>Uploading logo...</span>
                        </div>
                      )}
                      {logoFile && !company && (
                        <p className="text-xs text-green-400 mt-2">
                          Logo selected: {logoFile.name}
                        </p>
                      )}
                      {!company && !logoFile && (
                        <p className="text-xs text-amber-400 mt-2">
                          Note: You need to create your company profile first. Logo will be uploaded after creation.
                        </p>
                      )}
                      {company && !company.logo && !logoFile && !logoPreview && (
                        <p className="text-xs text-amber-400 mt-2">
                          No logo uploaded yet. Select an image to upload.
                        </p>
                      )}
                      {saving && (
                        <div className="flex items-center gap-2 mt-2 text-blue-400">
                          <MiniLoader />
                          <span>Saving profile...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter company name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                      Website *
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="desc" className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="desc"
                      name="desc"
                      value={formData.desc}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Describe your company, mission, and values"
                    />
                  </div>
                </div>
                
                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">
                      Industry
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-neutral-800 text-white">Select industry</option>
                      {industryOptions.map(industry => (
                        <option key={industry} value={industry} className="bg-neutral-800 text-white">{industry}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-2">
                      Company Size
                    </label>
                    <select
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-neutral-800 text-white">Select company size</option>
                      {sizeOptions.map(size => (
                        <option key={size} value={size} className="bg-neutral-800 text-white">{size} employees</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-300 mb-2">
                      Employee Count
                    </label>
                    <input
                      type="number"
                      id="employeeCount"
                      name="employeeCount"
                      value={formData.employeeCount}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Number of employees"
                    />
                  </div>
                </div>
                
                {/* Social Media Links */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Social Media Links</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="socialMedia.linkedin" className="block text-sm font-medium text-gray-300 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        id="socialMedia.linkedin"
                        name="socialMedia.linkedin"
                        value={formData.socialMedia.linkedin}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://linkedin.com/company/example"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="socialMedia.twitter" className="block text-sm font-medium text-gray-300 mb-2">
                        Twitter
                      </label>
                      <input
                        type="url"
                        id="socialMedia.twitter"
                        name="socialMedia.twitter"
                        value={formData.socialMedia.twitter}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://twitter.com/example"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="socialMedia.facebook" className="block text-sm font-medium text-gray-300 mb-2">
                        Facebook
                      </label>
                      <input
                        type="url"
                        id="socialMedia.facebook"
                        name="socialMedia.facebook"
                        value={formData.socialMedia.facebook}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://facebook.com/example"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="socialMedia.instagram" className="block text-sm font-medium text-gray-300 mb-2">
                        Instagram
                      </label>
                      <input
                        type="url"
                        id="socialMedia.instagram"
                        name="socialMedia.instagram"
                        value={formData.socialMedia.instagram}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://instagram.com/example"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={saving || uploadingLogo || deleting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {saving || uploadingLogo ? (
                      <>
                        <MiniLoader />
                        {company ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{company ? "Update Profile" : "Create Profile"}</>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving || uploadingLogo || deleting}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 text-white rounded-lg transition-colors"
                  >
                    {saving || uploadingLogo || deleting ? (
                      <div className="flex items-center justify-center gap-2">
                        <MiniLoader />
                        Canceling...
                      </div>
                    ) : (
                      "Cancel"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper function to format validation errors
  function formatValidationErrors(errors) {
    if (!errors) return null;
    
    // If it's an array of errors
    if (Array.isArray(errors)) {
      return errors
        .map(error => {
          if (typeof error === 'string') return error;
          if (error.msg) return error.msg;
          if (error.message) return error.message;
          return JSON.stringify(error);
        })
        .join(', ');
    }
    
    // If it's an object with field-specific errors
    if (typeof errors === 'object') {
      const errorMessages = [];
      for (const [field, error] of Object.entries(errors)) {
        if (typeof error === 'string') {
          errorMessages.push(`${field}: ${error}`);
        } else if (Array.isArray(error)) {
          errorMessages.push(`${field}: ${error.join(', ')}`);
        } else if (error.msg || error.message) {
          errorMessages.push(`${field}: ${error.msg || error.message}`);
        }
      }
      return errorMessages.join(', ');
    }
    
    return null;
  }
}
