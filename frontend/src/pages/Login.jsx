import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { setAuthData, clearRateLimitData } from "../utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Bypass rate limiting for development
  const [rateLimited, setRateLimited] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);

  // Show success message after register redirect
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      window.history.replaceState({}, document.title); // remove state
    }
  }, [location.state]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      // Use the API service which now uses the proxy
      const response = await api.post('/auth/login', { email, password });

      console.log('Login response:', response.data); // Debug log

      // Handle different response structures
      let token, user;
      if (response.data.data) {
        // New format: { data: { token, user } }
        token = response.data.data.token;
        user = response.data.data.user;
      } else if (response.data.token && response.data.user) {
        // Alternative format: { token, user }
        token = response.data.token;
        user = response.data.user;
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      if (!token || !user) {
        throw new Error('Authentication failed. Please try again.');
      }

      setAuthData(token, user.role, user.name, user._id || user.id);
      
      // Clear any existing rate limit data on successful login
      clearRateLimitData('login');
      
      // Check for saved redirect path
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        // Default dashboard based on role
        if (user.role === "student") navigate("/student/dashboard");
        else if (user.role === "recruiter") navigate("/recruiter/dashboard");
        else if (user.role === "admin") navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = "Login failed. Please try again.";
      
      // Handle different HTTP status codes
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = "Invalid email or password. Please check your credentials.";
            break;
          case 401:
            errorMessage = "Invalid credentials. Please check your email and password.";
            break;
          case 429:
            // Bypass rate limiting for development - still show the error but don't enforce the limit
            console.log("Rate limit hit, but bypassing for development");
            errorMessage = "Too many login attempts. Rate limiting bypassed for development.";
            // Don't set rate limited state
            // setRateLimited(true);
            // const retryAfter = error.response.headers['retry-after'] || 30;
            // const countdownTime = Math.min(parseInt(retryAfter), 30);
            // setRetryCountdown(countdownTime);
            // setRetryCount(prev => prev + 1);
            // setRateLimitData('login', countdownTime);
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          case 503:
            errorMessage = "Service temporarily unavailable. Please try again later.";
            break;
          default:
            errorMessage = `Login failed (${error.response.status}). Please try again.`;
        }
        
        // Handle error response data if available
        if (error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
      } else if (error.request) {
        // Network error
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Retrying...';
          // For timeout errors, we let the API service handle retries
        } else {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
      } else {
        // Other errors
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
    style={{
          background:
            "linear-gradient(135deg, #ffffff14 0%, rgba(255, 255, 255, 0.12) 19%, rgba(255, 255, 255, 0.05) 28%, transparent 35%, transparent 100%), linear-gradient(to bottom, #18181b, #000000)",
        }}>
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
        <div className="p-6 sm:p-8 rounded-xl shadow-2xl border border-white/20 mt-8 sm:mt-10 bg-white/5 backdrop-blur-lg">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Welcome Back</h2>
            <p className="mt-1 sm:mt-2 text-gray-300 text-sm sm:text-base">Login to access your account</p>
          </div>

          {successMsg && (
            <div className="mb-5 sm:mb-6 p-3 bg-green-500/20 text-green-300 text-sm rounded-md flex justify-between items-center">
              <span>{successMsg}</span>
              <button
                onClick={() => setSuccessMsg("")} // FIXED
                className="text-green-300 hover:text-green-100"
                aria-label="Dismiss success"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 sm:mb-6 p-3 bg-red-500/20 text-red-300 text-sm rounded-md flex justify-between items-center">
              <div className="flex items-start gap-2">
                {errorMsg.includes('Too many login attempts') ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium mb-1">
                  {errorMsg.includes('Too many login attempts') ? 'Rate Limited' : 'Login Failed'}
                </p>
                <p>{errorMsg}</p>
                {errorMsg.includes('Too many login attempts') && (
                  <div className="mt-2 sm:mt-3 space-y-2">
                    {retryCountdown > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>You can try again in {retryCountdown} seconds</span>
                      </div>
                    )}
                    <p className="text-xs opacity-80">
                      💡 Tip: Clear your browser cache or try using incognito mode if this persists.
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setErrorMsg("")}
                className="text-red-300 hover:text-red-100 flex-shrink-0"
                aria-label="Dismiss error"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
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
                autoComplete="email"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-500 rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white text-sm sm:text-base"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || rateLimited}
              />
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full pr-10 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-500 rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white text-sm sm:text-base"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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
            </div>

            <button
              type="submit"
              disabled={loading || rateLimited}
              className={`w-full py-2.5 px-4 font-semibold rounded-full border transition ${
                loading || rateLimited
                  ? "opacity-50 cursor-not-allowed bg-gray-600 border-gray-500 text-gray-300" 
                  : "bg-white/10 border-white/30 text-white hover:bg-white/20"
              } text-sm sm:text-base`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging in...
                </div>
              ) : rateLimited ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {retryCountdown > 0 ? `Retry in ${retryCountdown}s` : "Rate Limited"}
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center text-sm">
            <p className="text-gray-300">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-white hover:text-gray-200"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;