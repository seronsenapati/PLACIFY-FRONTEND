import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import { cachedApiCall } from "../../utils/cache";
import LoadingScreen from "../../components/LoadingScreen";
import MiniLoader from "../../components/MiniLoader";
import Message from "../../components/Message";
import { getRole, getUserId } from "../../utils/auth";

export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [company, setCompany] = useState(null);
  const [jobsCount, setJobsCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
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

  // Ensure form data is properly initialized
  console.log("[Company Profile] Initial form data:", formData);

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
  const userId = getUserId();
  console.log("[Company Profile] Current role:", role);
  console.log("[Company Profile] Current userId:", userId);

  if (role !== 'recruiter') {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex justify-center items-center">
        <Message 
          type="error" 
          title="Access Denied"
          message={`This page is only accessible to recruiters. Your current role is: ${role || 'unknown'}`}
        />
        <div className="mt-6">
          <a
            href="/recruiter/dashboard"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Check if userId exists for recruiters
  if (!userId) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex justify-center items-center">
        <Message 
          type="error" 
          title="Authentication Error"
          message="User ID not found. Please log in again."
        />
        <div className="mt-6">
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go to Login
          </a>
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

  // Fetch jobs count when company changes
  useEffect(() => {
    fetchJobsCount();
  }, [company]);

  // Add the fetchJobsCount function
  async function fetchJobsCount() {
    try {
      console.log("[fetch jobs count] Starting to fetch jobs count");
      
      // If we don't have a company yet, set count to 0
      if (!company || !company._id) {
        console.log("[fetch jobs count] No company found, setting count to 0");
        setJobsCount(0);
        return;
      }
      
      // Fetch all jobs for the recruiter with caching
      const res = await cachedApiCall(
        () => api.get(`/jobs/recruiter/my-jobs`),
        "/jobs/recruiter/my-jobs"
      );
      console.log("[fetch jobs count] Response received:", res);
      
      if (res && res.data && res.data.data) {
        const jobsData = res.data.data;
        console.log("[fetch jobs count] Jobs data:", jobsData);
        
        // Following the same structure as ManageJobs.jsx
        const jobs = jobsData.jobs || [];
        console.log("[fetch jobs count] Extracted jobs array:", jobs);
        
        // Filter jobs by company ID
        const companyJobs = jobs.filter(job => job.company && job.company._id === company._id);
        console.log("[fetch jobs count] Company jobs:", companyJobs);
        
        const count = companyJobs.length;
        console.log("[fetch jobs count] Jobs count:", count);
        setJobsCount(count);
      } else {
        console.log("[fetch jobs count] Invalid response structure");
        setJobsCount(0);
      }
    } catch (err) {
      console.error("[fetch jobs count] Error:", err);
      console.error("[fetch jobs count] Error response:", err.response);
      setJobsCount(0);
    }
  }

  // Update fetchCompanyProfile to also fetch jobs count
  async function fetchCompanyProfile() {
    try {
      setLoading(true);
      // Use cachedApiCall for GET requests that benefit from caching
      const res = await cachedApiCall(
        () => api.get("/companies"),
        "/companies"
      );
      console.log("[fetch company profile] Response:", res.data);

      // Check if recruiter has a company
      if (res.data?.data?.companies && res.data.data.companies.length > 0) {
        // Get user ID for filtering
        const currentUserId = getUserId();
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
            desc: userCompany.desc || userCompany.description || "",
            website: userCompany.website || "",
            location: userCompany.location || "",
            industry: validIndustryOptions.has(userCompany.industry) ? userCompany.industry : "Other",
            size: validSizeOptions.has(userCompany.size) ? userCompany.size : "1-10",
            employeeCount: userCompany.employeeCount || "",
            socialMedia: {
              linkedin: userCompany.socialMedia?.linkedin || "",
              twitter: userCompany.socialMedia?.twitter || "",
              facebook: userCompany.socialMedia?.facebook || "",
              instagram: userCompany.socialMedia?.instagram || ""
            }
          });
          setShowForm(false);
        } else {
          console.log("[fetch company profile] No company found for current user");
          setCompany(null);
          // Reset form data to defaults when no company found
          setFormData({
            name: "",
            desc: "",
            website: "",
            location: "",
            industry: "Other",
            size: "1-10",
            employeeCount: "",
            socialMedia: {
              linkedin: "",
              twitter: "",
              facebook: "",
              instagram: ""
            }
          });
          setShowForm(true);
        }
      } else {
        console.log("[fetch company profile] No companies found in response");
        setCompany(null);
        setShowForm(true);
      }
    } catch (err) {
      console.error("[fetch company profile] Error:", err);
      console.error("[fetch company profile] Error response:", err.response);
      setErrorMsg("Failed to load company profile");
      setCompany(null);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;

    console.log("[Company Profile] Input change:", name, value);

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
    setIsEditing(false);
    setShowForm(false);
  }

  function handleEdit() {
    setIsEditing(true);
    setShowForm(true);
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

  // Modified form submission to handle logo upload after company creation
  async function handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    console.log("[Company Profile] Form submission started");

    // Set saving state immediately
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      setErrorMsg("Company name is required");
      setSaving(false);
      return;
    }

    if (!formData.website || !formData.website.trim()) {
      setErrorMsg("Website is required");
      setSaving(false);
      return;
    }

    if (!formData.desc || !formData.desc.trim()) {
      setErrorMsg("Description is required");
      setSaving(false);
      return;
    }

    // Additional validation for field lengths
    if (formData.name.trim().length < 2) {
      setErrorMsg("Company name must be at least 2 characters long");
      setSaving(false);
      return;
    }

    if (formData.name.trim().length > 100) {
      setErrorMsg("Company name must be less than 100 characters");
      setSaving(false);
      return;
    }

    if (formData.desc.trim().length < 10) {
      setErrorMsg("Description must be at least 10 characters long");
      setSaving(false);
      return;
    }

    if (formData.desc.trim().length > 1000) {
      setErrorMsg("Description must be less than 1000 characters");
      setSaving(false);
      return;
    }

    // Validate URL format and ensure it's properly formatted
    let websiteUrl = formData.website.trim();

    // Add protocol if missing
    if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      websiteUrl = 'https://' + websiteUrl;
    }

    try {
      new URL(websiteUrl);
      // Update the website in formData to ensure it has the protocol
      formData.website = websiteUrl;
    } catch (err) {
      setErrorMsg("Please enter a valid website URL (e.g., https://example.com)");
      setSaving(false);
      return;
    }

    // Validate employeeCount if provided
    if (formData.employeeCount && formData.employeeCount !== "") {
      const employeeCount = parseInt(formData.employeeCount, 10);
      if (isNaN(employeeCount) || employeeCount < 0) {
        setErrorMsg("Employee count must be a valid positive number");
        setSaving(false);
        return;
      }
    }

    // Validate social media URLs if provided
    const socialMediaFields = ['linkedin', 'twitter', 'facebook', 'instagram'];
    const correctedSocialMedia = { ...formData.socialMedia };

    for (const field of socialMediaFields) {
      if (formData.socialMedia[field] && formData.socialMedia[field].trim() !== '') {
        try {
          // Add protocol if missing
          let url = formData.socialMedia[field].trim(); // Trim whitespace
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          new URL(url);
          // Update the corrected social media object
          correctedSocialMedia[field] = url;
        } catch (err) {
          setErrorMsg(`Please enter a valid ${field} URL or leave it empty`);
          setSaving(false);
          return;
        }
      } else {
        // Remove empty social media fields
        delete correctedSocialMedia[field];
      }
    }

    // Additional validation to ensure social media URLs are properly formatted
    Object.keys(correctedSocialMedia).forEach(key => {
      if (typeof correctedSocialMedia[key] === 'string') {
        correctedSocialMedia[key] = correctedSocialMedia[key].trim();
        // Ensure URL is valid
        try {
          new URL(correctedSocialMedia[key]);
        } catch (err) {
          console.error(`Invalid URL for ${key}:`, correctedSocialMedia[key]);
          delete correctedSocialMedia[key]; // Remove invalid URLs
        }
      }
    });

    // Ensure all social media URLs are properly formatted
    Object.keys(correctedSocialMedia).forEach(key => {
      if (correctedSocialMedia[key] && typeof correctedSocialMedia[key] === 'string') {
        correctedSocialMedia[key] = correctedSocialMedia[key].trim();
      }
    });

    // Prepare data for submission - be more explicit about what we're sending
    let submitData = {
      name: formData.name.trim(),
      desc: formData.desc.trim().substring(0, 1000), // Limit description length
      website: formData.website.trim()
    };

    // Additional validation to ensure desc doesn't exceed backend limits
    if (submitData.desc.length > 1000) {
      submitData.desc = submitData.desc.substring(0, 1000);
      console.warn("[Company Profile] Description truncated to 1000 characters");
    }

    // Only add optional fields if they have values
    if (formData.location && formData.location.trim()) {
      submitData.location = formData.location.trim();
    }

    if (formData.industry && formData.industry.trim()) {
      submitData.industry = formData.industry;
    }

    if (formData.size && formData.size.trim()) {
      submitData.size = formData.size;
    }

    // Handle employeeCount properly
    const employeeCount = formData.employeeCount !== "" ? parseInt(formData.employeeCount, 10) : NaN;
    if (!isNaN(employeeCount) && employeeCount >= 0) {
      submitData.employeeCount = employeeCount;
    } else if (formData.employeeCount !== "") {
      // If employeeCount is provided but invalid, show an error
      console.warn("[Company Profile] Invalid employeeCount provided:", formData.employeeCount);
    }

    // Handle socialMedia properly - ensure it's always an object even if empty
    if (Object.keys(correctedSocialMedia).length > 0) {
      submitData.socialMedia = { ...correctedSocialMedia };
    } else {
      // Always include socialMedia object even if empty
      submitData.socialMedia = {};
    }

    // Validate industry and size
    if (formData.industry && formData.industry.trim() !== "") {
      if (!validIndustryOptions.has(formData.industry)) {
        setErrorMsg("Please select a valid industry from the dropdown");
        setSaving(false);
        return;
      }
    }

    if (formData.size && formData.size.trim() !== "") {
      if (!validSizeOptions.has(formData.size)) {
        setErrorMsg("Please select a valid company size from the dropdown");
        setSaving(false);
        return;
      }
    }

    // Only include industry and size if they are selected
    if (!formData.industry || formData.industry.trim() === "") delete submitData.industry;
    if (!formData.size || formData.size.trim() === "") delete submitData.size;

    // Remove employeeCount if it's undefined
    if (submitData.employeeCount === undefined) {
      delete submitData.employeeCount;
    }

    // Remove other empty fields
    if (!submitData.location || submitData.location.trim() === "") delete submitData.location;

    // Clean up empty social media fields
    Object.keys(submitData.socialMedia).forEach(key => {
      if (!submitData.socialMedia[key] || submitData.socialMedia[key].trim() === '') {
        delete submitData.socialMedia[key];
      }
    });

    // Add createdBy field for new companies
    if (!company) {
      const userId = getUserId();
      console.log("[Company Profile] User ID from auth utils:", userId);

      // Validate userId format
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        setErrorMsg("User ID not found or invalid. Please log in again.");
        setSaving(false);
        return;
      }

      // Trim userId to remove any whitespace
      const trimmedUserId = userId.trim();
      console.log("[Company Profile] Trimmed User ID:", trimmedUserId);

      // Additional validation for userId format (ensure it looks like a MongoDB ObjectId)
      if (trimmedUserId.length !== 24 || !/^[0-9a-fA-F]+$/.test(trimmedUserId)) {
        console.error("[Company Profile] Invalid userId format:", trimmedUserId);
        setErrorMsg("User ID format is invalid. Please log in again.");
        setSaving(false);
        return;
      }

      // Add createdBy field for new companies
      submitData.createdBy = trimmedUserId;
    } else {
      // For updates, make sure we don't send createdBy
      delete submitData.createdBy;
    }

    // Final validation - remove any fields that are empty strings
    Object.keys(submitData).forEach(key => {
      if (key !== 'socialMedia' && typeof submitData[key] === 'string' && submitData[key].trim() === '') {
        delete submitData[key];
      }
      // Ensure all string fields are trimmed
      if (typeof submitData[key] === 'string') {
        submitData[key] = submitData[key].trim();
      }
    });

    // Ensure socialMedia is always an object
    if (!submitData.socialMedia || typeof submitData.socialMedia !== 'object') {
      submitData.socialMedia = {};
    }

    // Clean up socialMedia object to ensure it only contains valid fields
    const validSocialFields = ['linkedin', 'twitter', 'facebook', 'instagram'];
    const cleanedSocialMedia = {};

    validSocialFields.forEach(field => {
      if (submitData.socialMedia[field] && typeof submitData.socialMedia[field] === 'string' && submitData.socialMedia[field].trim() !== '') {
        cleanedSocialMedia[field] = submitData.socialMedia[field].trim();
      }
    });

    submitData.socialMedia = cleanedSocialMedia;

    // Log the data being sent for debugging
    console.log("[Company Profile] Sending data:", submitData);

    // Also log the raw form data for comparison
    console.log("[Company Profile] Raw form data:", formData);

    // Log the JSON stringified version to check for any serialization issues
    try {
      console.log("[Company Profile] JSON data being sent:", JSON.stringify(submitData, null, 2));
    } catch (jsonErr) {
      console.error("[Company Profile] Error serializing data:", jsonErr);
    }

    // Define isUpdating before using it
    const isUpdating = !!company;

    // Additional debugging before sending request
    console.log("[Company Profile] About to send request with config:");
    console.log("[Company Profile] Method:", isUpdating ? "PATCH" : "POST");
    console.log("[Company Profile] URL:", isUpdating ? `/companies/${company._id}` : "/companies");

    try {
      let res;

      if (isUpdating) {
        // Update existing company
        console.log("[Company Profile] Updating company with ID:", company._id);
        res = await api.patch(`/companies/${company._id}`, submitData);
      } else {
        // Create new company
        console.log("[Company Profile] Creating new company with data:", submitData);
        console.log("[Company Profile] JSON data being sent:", JSON.stringify(submitData, null, 2));
        res = await api.post("/companies", submitData);
      }

      console.log("[Company Profile] Response received:", res);
      console.log("[Company Profile] Response status:", res.status);
      console.log("[Company Profile] Response data:", res.data);

      // Check if response has the expected structure
      if (!res.data || !res.data.data) {
        console.error("[Company Profile] Invalid response structure:", res);
        throw new Error("Invalid response structure from server. The server response did not match the expected format.");
      }

      setCompany(res.data.data);
      setSuccessMsg(isUpdating ? "Company profile updated successfully!" : "Company profile created successfully!");

      // Fetch updated jobs count
      await fetchJobsCount();

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

      // Log detailed request information
      console.error("[save company profile] Request details:", {
        isUpdating,
        company,
        submitData,
        userId: getUserId()
      });

      // Log the exact data being sent in the request
      console.error("[save company profile] Exact request payload:", JSON.stringify(submitData, null, 2));

      // Log the error stack trace if available
      if (err.stack) {
        console.error("[save company profile] Error stack:", err.stack);
      }

      if (err.response?.status === 403) {
        setErrorMsg("Access denied. Please ensure you are logged in as a recruiter.");
      } else if (err.response?.status === 401) {
        setErrorMsg("Authentication required. Please log in again.");
      } else if (err.response?.status === 400) {
        // Handle validation errors
        let errorMessage = "Invalid company data. Please check all required fields.";

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
        }

        setErrorMsg(errorMessage);
      } else if (err.response?.status === 500) {
        // More detailed 500 error handling
        let errorMessage = "Failed to save company profile due to a server error. Please try again later.";

        // Check for specific error information in different parts of the response
        if (err.response?.data?.message) {
          errorMessage = `Server error: ${err.response.data.message}`;
        } else if (err.response?.data?.error) {
          errorMessage = `Server error: ${err.response.data.error}`;
        } else if (err.response?.data) {
          // If there's data but no message or error field, try to stringify it
          try {
            const errorData = JSON.stringify(err.response.data);
            if (errorData && errorData !== '{}') {
              errorMessage = `Server error with details: ${errorData}`;
            }
          } catch (stringifyError) {
            // If we can't stringify, just use the generic message
            console.error("Could not stringify error data:", stringifyError);
          }
        } else if (err.response?.statusText) {
          errorMessage = `Server error (${err.response.status}): ${err.response.statusText}`;
        }

        // If we still don't have a specific error message, show the status
        if (errorMessage === "Failed to save company profile due to a server error. Please try again later." && err.response?.status) {
          errorMessage = `Server error (${err.response.status}): ${err.response.statusText || 'Internal Server Error'}. Please try again later.`;
        }

        // Add additional debugging information
        console.error("Server Error Details:", {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers,
          config: err.config
        });

        // Log the request data that was sent
        console.error("Request data sent:", submitData);
        console.error("Request JSON:", JSON.stringify(submitData, null, 2));

        // Add a more user-friendly message
        errorMessage += " This is likely a backend issue. Please try again or contact support if the problem persists.";

        setErrorMsg(errorMessage);
      } else if (err.request) {
        // Network error
        console.error("Network error:", err.request);
        setErrorMsg("Network error. Please check your internet connection and try again. This could also indicate a problem with the backend server.");
      } else {
        // Other errors
        console.error("Error message:", err.message);
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

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

  // If still loading, show loading screen
  if (loading) {
    return (
      <LoadingScreen
        title="Loading Company Profile"
        subtitle="Fetching your company information..."
        steps={[
          { text: "Retrieving company data", color: "blue" },
          { text: "Loading jobs information", color: "purple" },
          { text: "Preparing interface", color: "green" }
        ]}
      />
    );
  }

  // If recruiter has a company and is not editing, show the company profile
  if (company && !isEditing) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start w-full">
        <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Company Profile</h1>
                <p className="text-gray-400">View and manage your company information</p>
              </div>

              <button
                onClick={handleEdit}
                className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>

            {/* Messages */}
            {errorMsg && (
              <Message 
                type="error" 
                message={errorMsg} 
                onClose={() => setErrorMsg("")} 
              />
            )}

            {successMsg && (
              <Message 
                type="success" 
                message={successMsg} 
                onClose={() => setSuccessMsg("")} 
              />
            )}

            {/* Company Profile Card */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <h2 className="text-lg sm:text-xl font-semibold">Company Information</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Your company details</p>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-white/30">
                      {company.logo ? (
                        <img 
                          src={company.logo} 
                          alt={company.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = '<div className="w-full h-full bg-gray-600 flex items-center justify-center"><svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold">{company.name}</h2>
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Website</p>
                        <p className="text-blue-400 hover:text-blue-300">
                          <a href={company.website} target="_blank" rel="noopener noreferrer">
                            {company.website}
                          </a>
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Jobs Posted</p>
                        <p className="font-medium">{jobsCount} jobs</p>
                      </div>
                      
                      {company.location && (
                        <div>
                          <p className="text-sm text-gray-400">Location</p>
                          <p>{company.location}</p>
                        </div>
                      )}
                      
                      {company.industry && (
                        <div>
                          <p className="text-sm text-gray-400">Industry</p>
                          <p>{company.industry}</p>
                        </div>
                      )}
                      
                      {company.size && (
                        <div>
                          <p className="text-sm text-gray-400">Company Size</p>
                          <p>{company.size}</p>
                        </div>
                      )}
                      
                      {company.employeeCount && (
                        <div>
                          <p className="text-sm text-gray-400">Employee Count</p>
                          <p>{company.employeeCount}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {company.desc && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    <p className="text-gray-300">{company.desc}</p>
                  </div>
                )}

                {/* Social Media */}
                {(company.socialMedia?.linkedin || company.socialMedia?.twitter || 
                  company.socialMedia?.facebook || company.socialMedia?.instagram) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Social Media</h3>
                    <div className="flex flex-wrap gap-3">
                      {company.socialMedia?.linkedin && (
                        <a 
                          href={company.socialMedia.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                          LinkedIn
                        </a>
                      )}
                      
                      {company.socialMedia?.twitter && (
                        <a 
                          href={company.socialMedia.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                          Twitter
                        </a>
                      )}
                      
                      {company.socialMedia?.facebook && (
                        <a 
                          href={company.socialMedia.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                          </svg>
                          Facebook
                        </a>
                      )}
                      
                      {company.socialMedia?.instagram && (
                        <a 
                          href={company.socialMedia.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={handleEdit}
                    className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                  
                  <button
                    onClick={handleDeleteCompany}
                    disabled={deleting}
                    className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-red-500/20 hover:border-red-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <MiniLoader />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Company
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If recruiter doesn't have a company or is editing, show the form
  return (
    <div className="min-h-[calc(100vh-6rem)] flex justify-center items-start w-full">
      <div className="w-full max-w-1xl mx-auto p-3 bg-black/20 rounded-lg min-h-[calc(100vh-8rem)]">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {company ? "Edit Company Profile" : "Create Company Profile"}
            </h1>
            <p className="text-gray-400">
              {company 
                ? "Update your company information" 
                : "Set up your company profile to start posting jobs"}
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <Message 
              type="error" 
              message={errorMsg} 
              onClose={() => setErrorMsg("")} 
            />
          )}

          {successMsg && (
            <Message 
              type="success" 
              message={successMsg} 
              onClose={() => setSuccessMsg("")} 
            />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Logo Upload */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                  <h2 className="text-lg sm:text-xl font-semibold">Company Logo</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Upload your company logo</p>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Logo Preview */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-white/30">
                        {logoPreview || company?.logo ? (
                          <img 
                            src={logoPreview || company?.logo} 
                            alt="Company Logo Preview" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Upload Button */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {uploadingLogo ? (
                            <>
                              <MiniLoader />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {company ? "Change Logo" : "Upload Logo"}
                            </>
                          )}
                        </button>
                        
                        <input
                          type="file"
                          ref={logoInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        <p className="text-sm text-gray-400">
                          JPG, PNG, or GIF (max 5MB)
                        </p>
                      </div>
                      
                      {logoPreview && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setLogoPreview(null);
                              setLogoFile(null);
                              if (logoInputRef.current) {
                                logoInputRef.current.value = "";
                              }
                            }}
                            className="text-sm text-red-400 hover:text-red-300 underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                  <h2 className="text-lg sm:text-xl font-semibold">Company Information</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Basic details about your company</p>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Name */}
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                    
                    {/* Website */}
                    <div className="md:col-span-2">
                      <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                        Website *
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://example.com"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        Include https:// or http:// in the URL
                      </p>
                    </div>
                    
                    {/* Description */}
                    <div className="md:col-span-2">
                      <label htmlFor="desc" className="block text-sm font-medium text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        id="desc"
                        name="desc"
                        value={formData.desc}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Describe your company..."
                        required
                      />
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-400">
                          Brief description of your company
                        </p>
                        <p className="text-xs text-gray-400">
                          {formData.desc.length}/1000
                        </p>
                      </div>
                    </div>
                    
                    {/* Location */}
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
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="City, Country"
                      />
                    </div>
                    
                    {/* Industry */}
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">
                        Industry
                      </label>
                      <select
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Industry</option>
                        {industryOptions.map(industry => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Company Size */}
                    <div>
                      <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-2">
                        Company Size
                      </label>
                      <select
                        id="size"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>
                    
                    {/* Employee Count */}
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
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Number of employees"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                  <h2 className="text-lg sm:text-xl font-semibold">Social Media</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Your company's social media profiles</p>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LinkedIn */}
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
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://linkedin.com/company/..."
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        Include https:// in the URL
                      </p>
                    </div>
                    
                    {/* Twitter */}
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
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://twitter.com/..."
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        Include https:// in the URL
                      </p>
                    </div>
                    
                    {/* Facebook */}
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
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://facebook.com/..."
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        Include https:// in the URL
                      </p>
                    </div>
                    
                    {/* Instagram */}
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
                        className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://instagram.com/..."
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        Include https:// in the URL
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-4 font-semibold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <MiniLoader size="sm" color="white" />
                      <span>{company ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {company ? "Update Company" : "Create Company"}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition flex items-center gap-2"
                >
                  Cancel
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}