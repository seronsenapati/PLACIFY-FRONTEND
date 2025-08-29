import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { setAuthData } from "../utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      // Make a direct fetch request instead of using the API client to avoid interceptor issues
      const response = await fetch('https://placify-backend-3wpm.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('Login response:', data); // Debug log

      if (!response.ok) {
        console.error('Login failed:', data); // Debug log
        throw new Error(data.message || 'Login failed');
      }

      // Handle different response structures
      let token, user;
      if (data.data) {
        // New format: { data: { token, user } }
        token = data.data.token;
        user = data.data.user;
      } else if (data.token && data.user) {
        // Alternative format: { token, user }
        token = data.token;
        user = data.user;
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format from server');
      }

      console.log('User data:', user); // Debug log
      setAuthData(token, user.role, user.name);
      
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
      // Show more specific error messages
      let errorMessage = error.message || "Login failed. Please check your credentials and try again.";
      
      // Add debugging info for development
      if (error.message && error.message.includes('Invalid response format')) {
        errorMessage += " (Check browser console for details)";
      }
      
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
    style={{
          background:
            "linear-gradient(135deg, #ffffff14 0%, rgba(255, 255, 255, 0.12) 19%, rgba(255, 255, 255, 0.05) 28%, transparent 35%, transparent 100%), linear-gradient(to bottom, #18181b, #000000)",
        }}>
      <div className="w-full max-w-md">
        <div className="p-8 rounded-xl shadow-2xl border border-white/20 mt-10 bg-white/5 backdrop-blur-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="mt-2 text-gray-300">Login to access your account</p>
          </div>

          {successMsg && (
            <div className="mb-6 p-3 bg-green-500/20 text-green-300 text-sm rounded-md flex justify-between items-center">
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
            <div className="mb-6 p-3 bg-red-500/20 text-red-300 text-sm rounded-md flex justify-between items-center">
              <span>{errorMsg}</span>
              <button
                onClick={() => setErrorMsg("")}
                className="text-red-300 hover:text-red-100"
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-2.5 border border-gray-500 rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  required
                  className="w-full pr-10 px-4 py-2.5 border border-gray-500 rounded-lg focus:ring-2 focus:ring-gray-800 bg-transparent text-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                          0112 5c4.478 0 8.268 2.943 9.543 7a10.025
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 font-semibold rounded-full bg-white/10 border border-white/30 text-white hover:bg-white/20 transition ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
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
