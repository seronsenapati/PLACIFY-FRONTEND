import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { setRateLimitData, clearRateLimitData } from "../utils/auth";
import Message from "../components/Message";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Bypass rate limiting for development
  const [rateLimited, setRateLimited] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState({});
  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

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

  // Password validation logic
  useEffect(() => {
    if (formData.password) {
      const validation = {
        length: formData.password.length >= 8,
        hasUpperCase: /[A-Z]/.test(formData.password),
        hasLowerCase: /[a-z]/.test(formData.password),
        hasNumber: /\d/.test(formData.password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
      };
      setPasswordValidation(validation);
    }
  }, [formData.password]);

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Full name is required";
        } else if (value.trim().length < 2) {
          error = "Full name must be at least 2 characters";
        }
        break;
      case "username":
        if (!value.trim()) {
          error = "Username is required";
        } else if (value.trim().length < 3) {
          error = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = "Username can only contain letters, numbers, and underscores";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(value)) {
          error = "Password must contain at least one uppercase letter";
        } else if (!/[a-z]/.test(value)) {
          error = "Password must contain at least one lowercase letter";
        } else if (!/\d/.test(value)) {
          error = "Password must contain at least one number";
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
          error = "Password must contain at least one special character (!@#$%^&*()_+-=[]{};':\"\\|,.<>/?";
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    
    // Show password requirements when user starts typing in password field
    if (name === 'password') {
      setShowPasswordRequirements(true);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    if (error) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    let hasErrors = false;
    const newFieldErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newFieldErrors[key] = error;
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      setErrorMsg("Please fix the errors below and try again.");
      return;
    }
    
    setErrorMsg("");
    setSuccessMsg("");
    setFieldErrors({});
    setLoading(true);

    try {
      // Log the request for debugging
      console.log("Sending registration request with data:", formData);
      
      // Use the API service which now uses the proxy
      const response = await api.post('/auth/register', formData);

      // Clear any existing rate limit data on successful registration
      clearRateLimitData('register');
      
      // Registration successful
      navigate("/login", {
        state: { message: "Registration successful. Please log in." },
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      // Handle different HTTP status codes
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = "Invalid registration data. Please check all fields and try again.";
            // Extract specific field errors if available
            if (error.response.data?.errors) {
              const backendErrors = {};
              error.response.data.errors.forEach(err => {
                // Map backend field names to frontend field names if needed
                const fieldName = err.field || err.param || 'general';
                // Special handling for common field name mappings
                const mappedFieldName = fieldName === 'username' ? 'username' :
                                      fieldName === 'email' ? 'email' :
                                      fieldName === 'password' ? 'password' :
                                      fieldName === 'name' ? 'name' : 'general';
                backendErrors[mappedFieldName] = err.message || errorMessage;
              });
              setFieldErrors(backendErrors);
            } else if (error.response.data?.message) {
              // If there's a general message but no specific field errors
              errorMessage = error.response.data.message;
            }
            break;
          case 409:
            errorMessage = "Email or username already exists. Please try different credentials.";
            break;
          case 422:
            errorMessage = "Validation failed. Please check your input and try again.";
            break;
          case 429:
            // Bypass rate limiting for development - still show the error but don't enforce the limit
            console.log("Rate limit hit, but bypassing for development");
            errorMessage = "Too many registration attempts. Rate limiting bypassed for development.";
            // Don't set rate limited state
            // setRateLimited(true);
            // const retryAfter = error.response.headers['retry-after'] || 30;
            // const countdownTime = Math.min(parseInt(retryAfter), 30);
            // setRetryCountdown(countdownTime);
            // setRetryCount(prev => prev + 1);
            // setRateLimitData('register', countdownTime);
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          case 503:
            errorMessage = "Service temporarily unavailable. Please try again later.";
            break;
          default:
            errorMessage = `Registration failed (${error.response.status}). Please try again.`;
        }
        
        // Handle error response data if available
        if (error.response.data) {
          if (error.response.data.message && !error.response.data.errors) {
            errorMessage = error.response.data.message;
          }
          // Handle validation errors from backend
          if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
            errorMessage = error.response.data.errors.join(', ');
          }
        }
      } else if (error.request) {
        // Network error
        console.error('No response received:', error.request);
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Retrying...';
          // For timeout errors, we let the API service handle retries
        } else {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
      } else {
        // Other errors
        console.error('Error setting up request:', error.message);
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        background:
          "linear-gradient(135deg, #ffffff14 0%, rgba(255, 255, 255, 0.12) 19%, rgba(255, 255, 255, 0.05) 28%, transparent 35%, transparent 100%), linear-gradient(to bottom, #18181b, #000000)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Development utility - remove in production */}
        {import.meta.env.DEV && (
          <div className="mb-4">
            <details className="text-xs">
              <summary className="text-yellow-300 cursor-pointer">Development Utilities</summary>
              <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <p className="text-yellow-200 mb-2">Rate limiting is bypassed in development mode.</p>
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="px-2 py-1 bg-red-500/20 text-red-200 rounded text-xs hover:bg-red-500/30"
                >
                  Clear All Local Storage & Refresh
                </button>
              </div>
            </details>
          </div>
        )}
        <div className="p-5 sm:p-6 rounded-xl shadow-2xl border border-white/20 mt-8 sm:mt-10 bg-white/5 backdrop-blur-lg">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Create an Account</h2>
            <p className="mt-1 sm:mt-2 text-gray-300 text-sm sm:text-base">Join us today</p>
          </div>

          {successMsg && (
            <Message 
              type="success" 
              message={successMsg} 
              onClose={() => setSuccessMsg("")} 
            />
          )}

          {errorMsg && (
            <Message 
              type="error" 
              message={errorMsg} 
              onClose={() => setErrorMsg("")} 
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white text-sm sm:text-base ${
                  fieldErrors.name ? 'border-red-500' : 'border-gray-500'
                }`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading || rateLimited}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-red-400 text-xs">{fieldErrors.name}</p>
              )}
            </div>

            {/* ✅ New Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white text-sm sm:text-base ${
                  fieldErrors.username ? 'border-red-500' : 'border-gray-500'
                }`}
                placeholder="johndoe123"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading || rateLimited}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-red-400 text-xs">{fieldErrors.username}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white text-sm sm:text-base ${
                  fieldErrors.email ? 'border-red-500' : 'border-gray-500'
                }`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading || rateLimited}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-red-400 text-xs">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full pr-10 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white text-sm sm:text-base ${
                    fieldErrors.password ? 'border-red-500' : 'border-gray-500'
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => setShowPasswordRequirements(true)}
                  disabled={loading || rateLimited}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading || rateLimited}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                          a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243
                          4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532
                          7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0
                          0112 5c4.478 0 8.268 2.943 9.542
                          7a10.025
                          10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                        d="M2.458 12C3.732 7.943 7.523 5
                          12 5c4.478 0 8.268 2.943 9.542
                          7-1.274 4.057-5.064 7-9.542
                          7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-red-400 text-xs">{fieldErrors.password}</p>
              )}
              
              {/* Password Requirements */}
              {showPasswordRequirements && (
                <div className="mt-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-300 font-medium text-xs mb-1">Password Requirements</p>
                  <ul className="text-blue-200 text-xs space-y-1">
                    <li className={`flex items-center ${passwordValidation.length ? 'text-green-400' : ''}`}>
                      {passwordValidation.length ? (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-400' : ''}`}>
                      {passwordValidation.hasUpperCase ? (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      Contains uppercase letter (A-Z)
                    </li>
                    <li className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-400' : ''}`}>
                      {passwordValidation.hasLowerCase ? (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      Contains lowercase letter (a-z)
                    </li>
                    <li className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-400' : ''}`}>
                      {passwordValidation.hasNumber ? (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      Contains number (0-9)
                    </li>
                    <li className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-400' : ''}`}>
                      {passwordValidation.hasSpecialChar ? (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      Contains special character (!@#$%^&amp;*()_+-=[]&#123;&#125;;':"\|,.&lt;&gt;/?))
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white appearance-none cursor-pointer text-sm sm:text-base"
                value={formData.role}
                onChange={handleChange}
                disabled={loading || rateLimited}
              >
                <option value="student" className="bg-gray-800">Student</option>
                <option value="recruiter" className="bg-gray-800">Recruiter</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 top-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || rateLimited}
              className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all ${
                loading || rateLimited
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-white text-gray-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-800"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : rateLimited ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {retryCountdown > 0 ? `Retry in ${retryCountdown}s` : "Rate Limited"}
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center text-sm">
            <p className="text-gray-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-white hover:text-gray-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;